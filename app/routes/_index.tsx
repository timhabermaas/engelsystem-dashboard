import { Title, SimpleGrid, Text, Stack } from "@mantine/core";
import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format, parseISO } from "date-fns";
import { NotNull } from "kysely";
import { useState } from "react";
import { db } from "~/db/connection";
import { groupBy } from "~/utils";
import { ShiftCard } from "~/components/shift-card";
import { SearchableMultiSelect } from "~/components/searchable-multi-select";
import { useSet } from "@mantine/hooks";
import { ShiftTypeFilter } from "~/components/shift-type-filter";
import { TimespanSlider } from "~/components/timespan-slider";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard Engelsystem" },
    {
      name: "description",
      content: "Read-only dashboard displaying all shifts",
    },
  ];
};

export async function loader() {
  const shifts = await db
    .selectFrom("shifts")
    .innerJoin("locations", "locations.id", "shifts.location_id")
    .innerJoin("shift_types", "shift_types.id", "shifts.shift_type_id")
    .select([
      "shifts.id",
      "shifts.title",
      "shifts.start",
      "shifts.end",
      "shifts.description",
      "shifts.created_at",
      "shifts.updated_at",
      "locations.id as location_id",
      "locations.name as location_name",
      "shift_types.id as shift_type_id",
      "shift_types.name as shift_type_name",
    ])
    .orderBy("shifts.start")
    .execute();

  const shift_entries = await db
    .selectFrom("shift_entries")
    .innerJoin("users", "shift_entries.user_id", "users.id")
    .innerJoin("angel_types", "angel_type_id", "angel_types.id")
    .select([
      "shift_entries.id",
      "users.id as user_id",
      "users.name as user_name",
      "angel_types.id as angel_type_id",
      "shift_id",
    ])
    .execute();

  const needed_angel_types = await db
    .selectFrom("needed_angel_types")
    .innerJoin(
      "angel_types",
      "angel_types.id",
      "needed_angel_types.angel_type_id"
    )
    .select([
      "shift_id",
      "angel_type_id as id",
      "count as needs",
      "angel_types.name as angel_type_name",
    ])
    .where("shift_id", "is not", null)
    .where("angel_type_id", "is not", null)
    .$narrowType<{ shift_id: NotNull }>()
    .$narrowType<{ id: NotNull }>()
    .execute();

  const needed_angel_types_by_id = groupBy(
    needed_angel_types,
    (na) => na.shift_id
  );

  const shift_entries_by_id = groupBy(
    shift_entries,
    (se) => `${se.shift_id}-${se.angel_type_id}`
  );

  const combined_shifts = shifts.map((s) => ({
    ...s,
    needed_angel_types: needed_angel_types_by_id[s.id].map((na) => {
      const entries = shift_entries_by_id[`${s.id}-${na.id}`] ?? [];
      return {
        ...na,
        entries,
        count: entries.length,
      };
    }),
  }));

  const users = await db
    .selectFrom("users")
    .select(["id", "name"])
    .orderBy("name")
    .execute();

  const shift_types = await db
    .selectFrom("shift_types")
    .select(["id", "name", "description"])
    .orderBy("name")
    .execute();

  return json({
    users,
    shifts,
    shift_entries,
    needed_angel_types_by_id,
    shift_entries_by_id,
    combined_shifts,
    shift_types,
    engelsystem_url: process.env.ENGELSYSTEM_URL,
  });
}

// TODO:
// * Header with fullscreen button (useFullscreen)

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const selectedShiftTypes = useSet<number>(
    data.shift_types.map((st) => st.id)
  );

  const [filterStart, setFilterStart] = useState<Date | null>(null);
  const [filterEnd, setFilterEnd] = useState<Date | null>(null);

  let filtered_shifts = data.combined_shifts;

  if (selectedUserIds.length > 0) {
    filtered_shifts = filtered_shifts.filter((s) =>
      s.needed_angel_types.some((at) =>
        at.entries.some((e) => selectedUserIds.includes(e.user_id))
      )
    );
  }

  filtered_shifts = filtered_shifts.filter((s) =>
    selectedShiftTypes.has(s.shift_type_id)
  );

  if (filterStart !== null) {
    filtered_shifts = filtered_shifts.filter(
      (s) => parseISO(s.start).getTime() >= filterStart.getTime()
    );
  }
  if (filterEnd !== null) {
    filtered_shifts = filtered_shifts.filter(
      (s) => parseISO(s.end).getTime() <= filterEnd.getTime()
    );
  }

  const shiftsByDate = groupBy(filtered_shifts, (s) =>
    format(parseISO(s.start), "yyyy-MM-dd")
  );

  return (
    <>
      <Title ta="center" mb={20} order={1}>
        Shifts Overview
      </Title>
      <SimpleGrid cols={{ sm: 2, md: 3 }} mb={"xl"} spacing="xl">
        <Stack>
          <Text component="label" size="sm" fw={500}>
            Timespan
          </Text>
          <TimespanSlider
            start={parseISO(data.combined_shifts[0].start)}
            end={parseISO(
              data.combined_shifts[data.combined_shifts.length - 1].end
            )}
            onChangeEnd={([start, end]) => {
              setFilterStart(start);
              setFilterEnd(end);
            }}
          />
        </Stack>
        <Stack gap="xs">
          <Text component="label" size="sm" fw={500}>
            Angels
          </Text>
          <SearchableMultiSelect
            options={data.users.map(({ id, name }) => [id.toString(), name])}
            onChangeOptions={(values) => {
              setSelectedUserIds(values.map((i) => parseInt(i)));
            }}
          />
        </Stack>
        <Stack>
          <Text component="label" size="sm" fw={500}>
            Shift Type
          </Text>
          <ShiftTypeFilter
            shiftTypes={data.shift_types}
            selected={selectedShiftTypes}
            onChange={(id, checked) => {
              if (checked) {
                selectedShiftTypes.add(id);
              } else {
                selectedShiftTypes.delete(id);
              }
            }}
          />
        </Stack>
      </SimpleGrid>

      {Object.entries(shiftsByDate).map(([d, shifts]) => (
        /* TODO: Move this into its own component and use targetRef inside */
        <>
          <Title ta="center" mb={20} order={2}>
            {format(parseISO(d), "eeee, do MMMM")}
          </Title>
          <SimpleGrid mb={40} cols={{ lg: 4, md: 3, sm: 2, xs: 1 }}>
            {shifts.map((s) => (
              <ShiftCard shift={s} key={s.id} />
            ))}
          </SimpleGrid>
        </>
      ))}
    </>
  );
}
