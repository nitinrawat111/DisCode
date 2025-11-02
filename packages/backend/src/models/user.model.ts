import {
  Generated,
  ColumnType,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";

////////////////////////////////////////////
// User Roles
////////////////////////////////////////////
export const UserRole = {
  SuperAdmin: "superadmin",
  Admin: "admin",
  Moderator: "moderator",
  Normal: "normal",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

////////////////////////////////////////////
// User Table Definition
// Postgres will convert all column names to lowercase
// Hence using snake case for database columns
// Reference: https://kysely.dev/docs/getting-started
////////////////////////////////////////////
export interface UserTable {
  user_id: Generated<number>;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  // Use null to define optional fields
  // If a field's value is null in the DB, then null will be returned here (not undefined)
  // Reference: https://github.com/kysely-org/kysely/issues/27#issuecomment-986076120
  bio: string | null;
  avatar_url: string | null;
  created_at: ColumnType<Date, never, never>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

/**
 * User without passowrd_hash
 */
export type UserProfile = Omit<User, "password_hash">;
