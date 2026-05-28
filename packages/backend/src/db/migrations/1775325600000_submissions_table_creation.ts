import { sql, type Kysely } from "kysely";

// `any`(or unknown) is required here since migrations should be frozen in time
// Migrations should never depend on the current code of your app
// because they need to work even when the app changes
// For more info, see: https://kysely.dev/docs/migrations
export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE TYPE programming_language AS ENUM ('cpp')`.execute(db);

  await sql`CREATE TYPE submission_status AS ENUM ('queued', 'compile_error', 'runtime_error', 'time_limit_exceeded', 'wrong_answer', 'successful', 'server_error')`.execute(
    db,
  );

  await db.schema
    .createTable("submissions")
    .addColumn("submission_id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.notNull().references("users.user_id").onDelete("cascade"),
    )
    .addColumn("problem_id", "integer", (col) =>
      col.notNull().references("problems.problem_id").onDelete("cascade"),
    )
    .addColumn("submission_key", "text", (col) => col.notNull())
    .addColumn("language", sql`programming_language`, (col) => col.notNull())
    .addColumn("status", sql`submission_status`, (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("executed_at", "timestamptz")
    .addColumn("completed_at", "timestamptz")
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

// `any`(or unknown) is required here since migrations should be frozen in time
// Migrations should never depend on the current code of your app
// because they need to work even when the app changes
// For more info, see: https://kysely.dev/docs/migrations
export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("submissions").execute();
  await sql`DROP TYPE programming_language`.execute(db);
  await sql`DROP TYPE submission_status`.execute(db);
}
