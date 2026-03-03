import { sql, type Kysely } from "kysely";

// `any`(or unknown) is required here since migrations should be frozen in time
// Migrations should never depend on the current code of your app
// because they need to work even when the app changes
// For more info, see: https://kysely.dev/docs/migrations
export async function up(db: Kysely<unknown>): Promise<void> {
  // Create enum type for problem difficulty
  await sql`CREATE TYPE problem_difficulty AS ENUM ('easy', 'medium', 'hard')`.execute(db);

  await db.schema
    .createTable("problems")
    .addColumn("problem_id", "serial", (col) => col.primaryKey())
    .addColumn("title", "varchar(200)", (col) => col.notNull())
    .addColumn("markdown_key", "text", (col) => col.notNull())
    .addColumn("test_keys", sql`text[]`, (col) => col.notNull())
    .addColumn("difficulty", sql`problem_difficulty`, (col) => col.notNull())
    .addColumn("tags", sql`text[]`, (col) => col.notNull().defaultTo(sql`'{}'`))
    .addColumn("created_by", "integer", (col) =>
      col.notNull().references("users.user_id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
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
  await db.schema.dropTable("problems").execute();
  // Drop the enum type after dropping the table
  await sql`DROP TYPE problem_difficulty`.execute(db);
}
