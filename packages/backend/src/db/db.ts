import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Logger } from "../utils/logger";
import { UserTable } from "../models/user.model";

// Create the Postgres dialect for Kysely
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

////////////////////////////////////////////
// Database Definition
// Table names are pluralized
////////////////////////////////////////////
export interface Database {
  users: UserTable;
}

// Instantiate Database
// Reference: https://kysely.dev/docs/getting-started#instantiation
export const DB = new Kysely<Database>({
  dialect,
  log: (event) => {
    if (event.level === "error") {
      Logger.error(event.error);
    }
  },
});
