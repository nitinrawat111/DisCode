import { defineConfig } from "kysely-ctl";
import { DB } from "./src/db/db";

// Reference: https://github.com/kysely-org/kysely-ctl?tab=readme-ov-file#configuration
export default defineConfig({
  kysely: DB,
  migrations: {
    migrationFolder: "./src/db/migrations",
  },
  seeds: {
    seedFolder: "./src/db/seeds",
  },
});
