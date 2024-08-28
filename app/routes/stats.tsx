import { Group, Title, NumberFormatter, Text } from "@mantine/core";
import { json, useLoaderData } from "@remix-run/react";
import { StatsCard } from "~/components/stats-card";
import { allAngelTypes, allShifts, allShiftTypes } from "~/db/repository";
import { differenceInMinutes } from "date-fns";
import { LoaderFunctionArgs } from "@remix-run/node";
import { FutureSwitch } from "~/components/future-switch";
import { parseFilterParams } from "~/hooks/use-filter-params";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const filterParams = parseFilterParams(url.searchParams);

  const angelTypes = await allAngelTypes();
  const shiftTypes = await allShiftTypes();

  const shifts = await allShifts({
    ongoing: filterParams.ongoing
  });

  const byAngelTypes = [];
  for (const at of angelTypes) {
    let worked = 0;
    let needed = 0;
    let overbooked = 0;

    for (const shift of shifts) {
      const hours = differenceInMinutes(shift.end, shift.start) / 60;
      const neededHours =
        (shift.neededAngelTypes.find((a) => a.angelTypeId == at.id)?.needs ??
          0) * hours;

      needed += neededHours;
    }

    for (const shift of shifts) {
      const hours = differenceInMinutes(shift.end, shift.start) / 60;
      const reservedHours =
        (shift.neededAngelTypes.find((a) => a.angelTypeId == at.id)?.count ??
          0) * hours;
      const neededHours =
        (shift.neededAngelTypes.find((a) => a.angelTypeId == at.id)?.needs ??
          0) * hours;

      if (reservedHours > neededHours) {
        worked += neededHours;
        overbooked += reservedHours - neededHours;
      } else {
        worked += reservedHours;
      }
    }

    byAngelTypes.push({ id: at.id, name: at.name, needed, worked, overbooked });
  }

  const byShiftTypes = [];
  for (const st of shiftTypes) {
    let worked = 0;
    let needed = 0;
    let overbooked = 0;

    for (const shift of shifts) {
      if (shift.shiftTypeId !== st.id) {
        continue;
      }
      const hours = differenceInMinutes(shift.end, shift.start) / 60;
      shift.neededAngelTypes
        .map((nat) => {
          if (nat.count > nat.needs) {
            return {
              neededHours: nat.needs * hours,
              workedHours: nat.needs * hours,
              overbookedHours: (nat.count - nat.needs) * hours,
            };
          } else {
            return {
              neededHours: nat.needs * hours,
              workedHours: nat.count * hours,
              overbookedHours: 0,
            };
          }
        })
        .forEach(({ workedHours, neededHours, overbookedHours }) => {
          worked += workedHours;
          needed += neededHours;
          overbooked += overbookedHours;
        });
    }

    byShiftTypes.push({ id: st.id, name: st.name, needed, worked, overbooked });
  }

  return json({
    angelTypes: byAngelTypes,
    shiftTypes: byShiftTypes,
  });
}

export default function Stats() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Title ta="center" mb={20} order={1}>
        Stats
      </Title>
      <Group justify="center" mb={30}>
        <FutureSwitch size="lg" />
      </Group>
      <Title ta="center" mb={20} order={2}>
        By Angel Type
      </Title>
      <Group justify="space-around" mb={30}>
        {data.angelTypes.map((at) => (
          <StatsCard
            key={at.id}
            color="teal"
            label={at.name}
            progress={(at.worked / at.needed) * 100}
            stats={
              <>
                <NumberFormatter
                  value={at.worked}
                  decimalScale={0}
                  suffix="h"
                />
                <Text span size="sm" fw={600}>
                  {" + "}
                  <NumberFormatter
                    value={at.overbooked}
                    decimalScale={0}
                    suffix="h"
                  />
                </Text>
                {" / "}
                <NumberFormatter
                  value={at.needed}
                  decimalScale={0}
                  suffix="h"
                />
              </>
            }
          />
        ))}
      </Group>
      <Title ta="center" mb={20} order={2}>
        By Shift Type
      </Title>
      <Group justify="space-around" mb={30}>
        {data.shiftTypes.map((st) => (
          <StatsCard
            key={st.id}
            color="teal"
            label={st.name}
            progress={(st.worked / st.needed) * 100}
            stats={
              <>
                <NumberFormatter
                  value={st.worked}
                  decimalScale={0}
                  suffix="h"
                />
                <Text span size="sm" fw={600}>
                  {" + "}
                  <NumberFormatter
                    value={st.overbooked}
                    decimalScale={0}
                    suffix="h"
                  />
                </Text>
                {" / "}
                <NumberFormatter
                  value={st.needed}
                  decimalScale={0}
                  suffix="h"
                />
              </>
            }
          />
        ))}
      </Group>
    </>
  );
}
