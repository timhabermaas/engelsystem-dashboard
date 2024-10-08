import {
  Title,
  SimpleGrid,
  Text,
  Stack,
  Group,
  Anchor,
  Accordion,
} from "@mantine/core";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { db } from "~/db/connection";
import { groupBy } from "~/utils";
import { ShiftCard } from "~/components/shift-card";
import { SearchableMultiSelect } from "~/components/searchable-multi-select";
import { useSet } from "@mantine/hooks";
import { ShiftTypeFilter } from "~/components/shift-type-filter";
import { TimespanSlider } from "~/components/timespan-slider";
import { allAngelTypes, allShifts, allShiftTypes } from "~/db/repository";
import { FutureSwitch } from "~/components/future-switch";
import { parseFilterParams } from "~/hooks/use-filter-params";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard Engelsystem" },
    {
      name: "description",
      content: "Read-only dashboard displaying all shifts",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const filterParams = parseFilterParams(url.searchParams);

  const combinedShifts = await allShifts({ ongoing: filterParams.ongoing });

  const users = await db
    .selectFrom("users")
    .select(["id", "name"])
    .orderBy("name")
    .execute();

  const shiftTypes = await allShiftTypes();

  const angelTypes = await allAngelTypes();

  return json({
    users,
    combinedShifts,
    shiftTypes,
    angelTypes,
    env: {
      ENGELSYSTEM_URL: process.env.ENGELSYSTEM_URL,
    },
  });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const selectedShiftTypes = useSet<number>(data.shiftTypes.map((st) => st.id));

  const selectedAngelTypes = useSet<number>(data.angelTypes.map((at) => at.id));

  const selectedOccupancy = useSet<number>([1, 2]);

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

  filteredShifts = filteredShifts.filter((s) =>
    s.neededAngelTypes.some((nat) => selectedAngelTypes.has(nat.angelTypeId))
  );

  filteredShifts = filteredShifts.filter((s) => {
    if (selectedOccupancy.has(1) && !selectedOccupancy.has(2)) {
      return s.neededAngelTypes.every((nat) => nat.count >= nat.needs);
    } else if (!selectedOccupancy.has(1) && selectedOccupancy.has(2)) {
      return s.neededAngelTypes.some((nat) => nat.count < nat.needs);
    } else if (selectedOccupancy.size === 0) {
      return false;
    } else {
      return true;
    }
  });

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
      <Accordion defaultValue="bar" mb={30}>
        <Accordion.Item value="filter">
          <Accordion.Control>
            <Title order={3}>Filter</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={{ xs: 2, sm: 2, lg: 4 }} mb={"xl"} spacing="xl">
              <Stack>
                <Text component="label" size="sm" fw={500}>
                  Timespan
                </Text>
                <Stack gap={35}>
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
                  <FutureSwitch size="sm" />
                </Stack>
              </Stack>
              <Stack gap="xs">
                <Text component="label" size="sm" fw={500}>
                  Angels
                </Text>
                <SearchableMultiSelect
                  options={data.users.map(({ id, name }) => [
                    id.toString(),
                    name,
                  ])}
                  onChangeOptions={(values) => {
                    setSelectedUserIds(values.map((i) => parseInt(i)));
                  }}
                />
              </Stack>
              <Stack>
                <Group justify="space-between">
                  <Text component="label" size="sm" fw={500}>
                    Shift Type
                  </Text>
                  <Group>
                    <Anchor
                      size="sm"
                      onClick={() =>
                        data.shiftTypes.forEach((st) =>
                          selectedShiftTypes.add(st.id)
                        )
                      }
                    >
                      All
                    </Anchor>
                    <Anchor
                      size="sm"
                      onClick={() => selectedShiftTypes.clear()}
                    >
                      None
                    </Anchor>
                  </Group>
                </Group>
                <ShiftTypeFilter
                  values={data.shiftTypes}
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
              <Stack>
                <Group justify="space-between">
                  <Text component="label" size="sm" fw={500}>
                    Angel Type
                  </Text>
                  <Group>
                    <Anchor
                      size="sm"
                      onClick={() =>
                        data.angelTypes.forEach((at) =>
                          selectedAngelTypes.add(at.id)
                        )
                      }
                    >
                      All
                    </Anchor>
                    <Anchor
                      size="sm"
                      onClick={() => selectedAngelTypes.clear()}
                    >
                      None
                    </Anchor>
                  </Group>
                </Group>

                <ShiftTypeFilter
                  color="blue"
                  values={data.angelTypes}
                  selected={selectedAngelTypes}
                  onChange={(id, checked) => {
                    if (checked) {
                      selectedAngelTypes.add(id);
                    } else {
                      selectedAngelTypes.delete(id);
                    }
                  }}
                />
              </Stack>
              <Stack>
                <Group justify="space-between">
                  <Text component="label" size="sm" fw={500}>
                    Occupancy
                  </Text>
                  <Group>
                    <Anchor
                      size="sm"
                      onClick={() =>
                        data.shiftTypes.forEach((st) =>
                          selectedOccupancy.add(st.id)
                        )
                      }
                    >
                      All
                    </Anchor>
                    <Anchor size="sm" onClick={() => selectedOccupancy.clear()}>
                      None
                    </Anchor>
                  </Group>
                </Group>

                <ShiftTypeFilter
                  color="blue"
                  values={[
                    { id: 1, name: "Occupied" },
                    { id: 2, name: "Free" },
                  ]}
                  selected={selectedOccupancy}
                  onChange={(id, checked) => {
                    if (checked) {
                      selectedOccupancy.add(id);
                    } else {
                      selectedOccupancy.delete(id);
                    }
                  }}
                />
              </Stack>
            </SimpleGrid>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {Object.entries(shiftsByDate).map(([d, shifts]) => (
        <div key={d}>
          <Title ta="center" mb={20} order={2}>
            {format(parseISO(d), "eeee, do MMMM")}
          </Title>
          <SimpleGrid mb={40} cols={{ xl: 5, lg: 4, md: 3, sm: 2, xs: 1 }}>
            {shifts.map((s) => (
              <ShiftCard
                shift={s}
                key={s.id}
                engelsystemUrl={`${data.env.ENGELSYSTEM_URL}/shifts?action=view&shift_id=${s.id}`}
              />
            ))}
          </SimpleGrid>
        </div>
      ))}
    </>
  );
}
