import { NotNull } from "kysely";
import { db } from "./connection";
import { groupBy } from "~/utils";

interface Shift {
  id: number;
  title: string;
  description: string;
  locationName: string;
  start: Date;
  end: Date;
  shiftTypeId: number;
  shiftTypeName: string;
  neededAngelTypes: {
    id: number;
    angelTypeId: number;
    angelTypeName: string;
    count: number;
    needs: number;
    entries: { id: number; userId: number; userName: string }[];
  }[];
}

export async function allShifts(): Promise<Shift[]> {
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

  const neededAngelTypes = await db
    .selectFrom("needed_angel_types")
    .innerJoin(
      "angel_types",
      "angel_types.id",
      "needed_angel_types.angel_type_id"
    )
    .select([
      "needed_angel_types.id",
      "shift_id as shiftId",
      "angel_type_id as angelTypeId",
      "count as needs",
      "angel_types.name as angelTypeName",
    ])
    .where("shift_id", "is not", null)
    .where("angel_type_id", "is not", null)
    .$narrowType<{ shiftId: NotNull }>()
    .execute();
  const neededAngelTypesById = groupBy(neededAngelTypes, (na) => na.shiftId);

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
  const shift_entries_by_id = groupBy(
    shiftEntries,
    (se) => `${se.shiftId}-${se.angelTypeId}`
  );

  return shifts.map((s) => ({
    ...s,
    neededAngelTypes: neededAngelTypesById[s.id].map((na) => {
      const entries = shift_entries_by_id[`${s.id}-${na.angelTypeId}`] ?? [];
      return {
        ...na,
        entries,
        count: entries.length,
      };
    }),
  }));
}

interface AngelType {
  id: number;
  name: string;
}

export async function allAngelTypes(): Promise<AngelType[]> {
  return await db.selectFrom("angel_types").select(["id", "name"]).execute();
}
