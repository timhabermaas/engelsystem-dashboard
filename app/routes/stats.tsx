import { Group, Title, NumberFormatter, Text } from "@mantine/core";
import { json, useLoaderData } from "@remix-run/react";
import { StatsCard } from "~/components/stats-card";
import { allAngelTypes, allShifts } from "~/db/repository";
import { differenceInMinutes } from "date-fns";

export async function loader() {
  const angelTypes = await allAngelTypes();

  const shifts = await allShifts();

  const result = [];
  for (const at of angelTypes) {
    console.log(`calculating for ${at.name}`);

    let worked = 0;
    let needed = 0;
    let overbooked = 0;

    for (const shift of shifts) {
      const hours = differenceInMinutes(shift.end, shift.start) / 60;
      const neededHours =
        (shift.neededAngelTypes.find((a) => a.angelTypeId == at.id)?.needs ??
          0) * hours;
      console.log(neededHours);

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

    result.push({ id: at.id, name: at.name, needed, worked, overbooked });
  }

  return json({
    angelTypes: result,
  });
}

export default function Stats() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Title ta="center" mb={20} order={1}>
        Stats
      </Title>
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
    </>
  );
}
