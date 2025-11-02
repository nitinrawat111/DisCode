import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Database } from "../types/db";
import { Logger } from "../utils/logger";

// Reference: https://kysely.dev/docs/getting-started#instantiation
const dialect = new PostgresDialect({
  pool: new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB_NAME,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
  }),
});

// Reference: https://kysely.dev/docs/getting-started#instantiation
export const DB = new Kysely<Database>({
  dialect,
  log: (event) => {
    if (event.level === "error") {
      Logger.error(event.error);
    }
  },
});
