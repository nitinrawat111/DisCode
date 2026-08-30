import { z } from "zod";
import { UserRole } from "../models/user.model";

////////////////////////////////////////////
// Common Dtos
////////////////////////////////////////////
export const UsernameDto = z.string().max(30).openapi({
  description: "User's username (max 30 characters)",
  example: "johndoe",
});
export const EmailDto = z.email().openapi({
  description: "User's email address",
  example: "user@example.com",
});
export const PasswordDto = z.string().min(8).openapi({
  description: "User's password (min 8 characters)",
  example: "password123",
});
export const BioDto = z
  .string()
  .openapi({ description: "User bio", example: "Software Engineer" });
export const AvatarUrlDto = z.string().openapi({
  description: "URL of the user's avatar",
  example: "https://example.com/avatar.png",
});
export const UserIdDto = z
  .number()
  .int()
  .positive()
  .openapi({ description: "User ID", example: 1 });
export const UserRoleDto = z
  .enum(UserRole)
  .openapi({ description: "User role", example: UserRole.Normal });

////////////////////////////////////////////
// Register Request Dto
////////////////////////////////////////////
export const RegisterRequestDto = z.object({
  username: UsernameDto,
  email: EmailDto,
  password: PasswordDto,
  bio: BioDto.nullish(),
  avatar_url: AvatarUrlDto.nullish(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestDto>;

////////////////////////////////////////////
// Login Request Dto
////////////////////////////////////////////
export const LoginRequestDto = z.object({
  email: EmailDto,
  password: PasswordDto,
});
export type LoginRequest = z.infer<typeof LoginRequestDto>;

////////////////////////////////////////////
// Change Role Request Dto
////////////////////////////////////////////
export const ChangeRoleRequestDto = z.object({
  new_role: UserRoleDto,
});
export type ChangeRoleRequest = z.infer<typeof ChangeRoleRequestDto>;

////////////////////////////////////////////
// Update Profile Request Dto
////////////////////////////////////////////
export const UpdateProfileRequestDto = z.object({
  username: UsernameDto.nullish(),
  bio: BioDto.nullish(),
  avatar_url: AvatarUrlDto.nullish(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestDto>;
