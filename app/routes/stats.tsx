import { db } from "~/db/connection";
import { Group, Title, NumberFormatter } from "@mantine/core";
import { json, useLoaderData } from "@remix-run/react";
import { NotNull, sql } from "kysely";
import { StatsCard } from "~/components/stats-card";

export async function loader() {
  const shifts = await db
    .selectFrom("shifts")
    .select((eb) => [
      "id",
      eb(
        eb.fn("TIMESTAMPDIFF", [
          sql<string>`MINUTE`,
          "shifts.start",
          "shifts.end",
        ]),
        "/",
        60
      ).as("duration"),
    ])
    .$narrowType<{ duration: string }>()
    .execute();

  const durationByShiftId: Map<number, number> = new Map();
  for (const s of shifts) {
    durationByShiftId.set(s.id, +s.duration);
  }

  const neededAngelTypes = await db
    .selectFrom("needed_angel_types")
    .select(["shift_id", "angel_type_id", "count"])
    .$narrowType<{ shift_id: NotNull; angel_type_id: NotNull }>()
    .execute();

  // All the following nested maps map from angel_type_id -> shift_id -> duration
  const neededHoursAngelTypeIdShiftId: Map<
    number,
    Map<number, number>
  > = new Map();
  for (const na of neededAngelTypes) {
    const shiftsMap =
      neededHoursAngelTypeIdShiftId.get(na.angel_type_id) ?? new Map();

    shiftsMap.set(na.shift_id, na.count * durationByShiftId.get(na.shift_id)!);

    neededHoursAngelTypeIdShiftId.set(na.angel_type_id, shiftsMap);
  }
  // TODO: save the mapping from (shift_id,angel_type_id) => number as well to make sure we're not overcounting

  const shiftEntries = await db
    .selectFrom("shift_entries")
    .select(["shift_id", "angel_type_id"])
    .execute();

  const loggedEntriesMap: Map<number, Map<number, number>> = new Map();
  for (const se of shiftEntries) {
    const shiftsMap = loggedEntriesMap.get(se.angel_type_id) ?? new Map();
    let duration = shiftsMap.get(se.shift_id) ?? 0;
    duration += durationByShiftId.get(se.shift_id)!;
    const shiftsMapNeeded = neededHoursAngelTypeIdShiftId.get(se.angel_type_id);
    const limit = shiftsMapNeeded && shiftsMapNeeded.get(se.shift_id);

    if (limit && duration > limit) {
      duration = limit;
    }
    shiftsMap.set(se.shift_id, duration);
    loggedEntriesMap.set(se.angel_type_id, shiftsMap);
  }

  const angelTypes = await db
    .selectFrom("angel_types")
    .select(["id", "name"])
    .execute();

  let hours: Map<number, { worked: number; needed: number }> = new Map();

  for (const at of angelTypes) {
    let needed = 0;
    for (const [_, value] of neededHoursAngelTypeIdShiftId.get(at.id) ??
      new Map()) {
      needed += value;
    }

    let worked = 0;
    for (const [_, value] of loggedEntriesMap.get(at.id) ?? new Map()) {
      worked += value;
    }

    hours.set(at.id, { worked, needed });
  }

  return json({
    angelTypes: angelTypes.map((at) => ({
      ...at,
      needed: hours.get(at.id)!.needed,
      worked: hours.get(at.id)!.worked,
    })),
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
      <Group justify="space-around">
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
