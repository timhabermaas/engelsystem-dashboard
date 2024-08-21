import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { DB } from "./db";

const dialect = new MysqlDialect({
  pool: createPool({
    database: "engelsystem",
    host: "localhost",
    user: "engelsystem",
    password: "engelsystem",
    port: 3306,
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
