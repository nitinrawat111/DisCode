import {
  Generated,
  ColumnType,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";

////////////////////////////////////////////
// Kysely Tables
// Table names are pluralized
////////////////////////////////////////////
export interface Database {
  users: UserTable;
}

////////////////////////////////////////////
// User Table
////////////////////////////////////////////
export const UserRole = {
  SuperAdmin: "superadmin",
  Admin: "admin",
  Moderator: "moderator",
  Normal: "normal",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Postgres will convert all column names to lowercase
// Hence using snake case for database columns
// TODO: Use camelCase plugin for kysely
// Reference: https://kysely.dev/docs/getting-started
export interface UserTable {
  user_id: Generated<number>;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  // null reference: https://github.com/kysely-org/kysely/issues/27#issuecomment-986076120
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
