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
      "locations.id as locationId",
      "locations.name as locationName",
      "shift_types.id as shiftTypeId",
      "shift_types.name as shiftTypeName",
    ])
    .orderBy("shifts.start")
    .execute();

  const shiftEntries = await db
    .selectFrom("shift_entries")
    .innerJoin("users", "shift_entries.user_id", "users.id")
    .innerJoin("angel_types", "angel_type_id", "angel_types.id")
    .select([
      "shift_entries.id",
      "users.id as userId",
      "users.name as userName",
      "angel_types.id as angelTypeId",
      "shift_id as shiftId",
    ])
    .execute();

  const neededAngelTypes = await db
    .selectFrom("needed_angel_types")
    .innerJoin(
      "angel_types",
      "angel_types.id",
      "needed_angel_types.angel_type_id"
    )
    .select([
      "shift_id as shiftId",
      "angel_type_id as id",
      "count as needs",
      "angel_types.name as angelTypeName",
    ])
    .where("shift_id", "is not", null)
    .where("angel_type_id", "is not", null)
    .$narrowType<{ shiftId: NotNull }>()
    .$narrowType<{ id: NotNull }>()
    .execute();

  const neededAngelTypesById = groupBy(neededAngelTypes, (na) => na.shiftId);

  const shift_entries_by_id = groupBy(
    shiftEntries,
    (se) => `${se.shiftId}-${se.angelTypeId}`
  );

  const combinedShifts = shifts.map((s) => ({
    ...s,
    neededAngelTypes: neededAngelTypesById[s.id].map((na) => {
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

  const shiftTypes = await db
    .selectFrom("shift_types")
    .select(["id", "name", "description"])
    .orderBy("name")
    .execute();

  return json({
    users,
    combinedShifts: combinedShifts,
    shiftTypes: shiftTypes,
  });
}

// TODO:
// * Header with fullscreen button (useFullscreen)

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const selectedShiftTypes = useSet<number>(data.shiftTypes.map((st) => st.id));

  const [filterStart, setFilterStart] = useState<Date | null>(null);
  const [filterEnd, setFilterEnd] = useState<Date | null>(null);

  let filteredShifts = data.combinedShifts;

  if (selectedUserIds.length > 0) {
    filteredShifts = filteredShifts.filter((s) =>
      s.neededAngelTypes.some((at) =>
        at.entries.some((e) => selectedUserIds.includes(e.userId))
      )
    );
  }

  filteredShifts = filteredShifts.filter((s) =>
    selectedShiftTypes.has(s.shiftTypeId)
  );

  if (filterStart !== null) {
    filteredShifts = filteredShifts.filter(
      (s) => parseISO(s.start).getTime() >= filterStart.getTime()
    );
  }
  if (filterEnd !== null) {
    filteredShifts = filteredShifts.filter(
      (s) => parseISO(s.end).getTime() <= filterEnd.getTime()
    );
  }

  const shiftsByDate = groupBy(filteredShifts, (s) =>
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
            start={parseISO(data.combinedShifts[0].start)}
            end={parseISO(
              data.combinedShifts[data.combinedShifts.length - 1].end
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
            shiftTypes={data.shiftTypes}
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
