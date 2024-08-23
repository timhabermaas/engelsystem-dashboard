import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { DB } from "./db";

const databaseUri =
  process.env.DATABASE_URL ??
  "mysql://engelsystem:engelsystem@localhost:3306/engelsystem";

const dialect = new MysqlDialect({
  pool: createPool({
    uri: databaseUri,
    connectionLimit: 10,
    typeCast(field, next) {
      if (field.type === "TINY" && field.length === 1) {
        return field.string() === "1";
      } else {
        return next();
      }
    },
  }),
});

export const db = new Kysely<DB>({
  dialect,
  log: ["error", "query"],
});
