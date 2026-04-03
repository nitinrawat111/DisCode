import { sql, type Kysely } from "kysely";

// `any`(or unknown) is required here since migrations should be frozen in time
// Migrations should never depend on the current code of your app
// because they need to work even when the app changes
// For more info, see: https://kysely.dev/docs/migrations
export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE TYPE submission_status AS ENUM (
    'Queued',
    'Compile Error',
    'Runtime Error',
    'Time Limit Error',
    'Wrong Answer',
    'Successful',
    'Server Error'
  )`.execute(db);

  await db.schema
    .createTable("submissions")
    .addColumn("submission_id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.notNull().references("users.user_id").onDelete("cascade"),
    )
    .addColumn("problem_id", "text", (col) => col.notNull())
    .addColumn("language", "varchar(50)", (col) => col.notNull())
    .addColumn("status", sql`submission_status`, (col) =>
      col.notNull().defaultTo(sql`'Queued'::submission_status`),
    )
    .addColumn("runtime", "float8")
    .addColumn("memory_used", "float8")
    .addColumn("test_cases_passed", "integer")
    .addColumn("total_test_cases", "integer")
    .addColumn("error_message", "text")
    .addColumn("submission_key", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("executed_at", "timestamptz")
    .execute();
}

// `any`(or unknown) is required here since migrations should be frozen in time
// Migrations should never depend on the current code of your app
// because they need to work even when the app changes
// For more info, see: https://kysely.dev/docs/migrations
export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("submissions").execute();
  await sql`DROP TYPE submission_status`.execute(db);
}
