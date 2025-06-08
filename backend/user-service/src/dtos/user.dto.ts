import zod from "zod";

export enum UserRoleEnum {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  MODERATOR = "moderator",
  NORMAL = "normal",
}

export const usernameDto = zod.string().max(30);
export const emailDto = zod.string().email();
export const passwordDto = zod.string().min(8);
export const bioDto = zod.string();
export const avatarUrlDto = zod.string();
export const userIdDto = zod.number().int().positive();
export const userRoleDto = zod.enum(
  Object.values(UserRoleEnum) as [string, ...string[]],
);
