import { z } from "zod/v4";
import { UserRole } from "../models/user.model";

////////////////////////////////////////////
// Common Dtos
////////////////////////////////////////////
export const UsernameDto = z.string().max(30);
export const EmailDto = z.email();
export const PasswordDto = z.string().min(8);
export const BioDto = z.string();
export const AvatarUrlDto = z.string();
export const UserIdDto = z.number().int().positive();
export const UserRoleDto = z.enum(UserRole);

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
