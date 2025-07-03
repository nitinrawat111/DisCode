import type { Kysely } from "kysely";
import { Database } from "../../types/db";
import { hash } from "bcrypt";

// Reference: https://github.com/kysely-org/kysely-ctl/issues/39#issuecomment-2178186380
export async function seed(db: Kysely<Database>): Promise<void> {
  const password = "12345678";
  const password_hash = await hash(password, 10);

  await db
    .insertInto("users")
    .values([
      {
        username: "adminuser",
        email: "admin@example.com",
        password_hash,
        avatar_url: "https://example.com/avatars/admin.png",
        bio: "Administrator account",
        role: "admin",
      },
      {
        username: "moduser",
        email: "mod@example.com",
        password_hash,
        avatar_url: "https://example.com/avatars/mod.png",
        bio: "Moderator account",
        role: "moderator",
      },
      {
        username: "normaluser",
        email: "user@example.com",
        password_hash,
        avatar_url: "https://example.com/avatars/user.png",
        bio: "Normal user account",
        role: "normal",
      },
    ])
    .execute();
}
