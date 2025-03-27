import zod from 'zod';
import { usernameDto, emailDto, passwordDto, bioDto, avatarUrlDto } from "./user.dto";

export const userRegistrationDto = zod.object({
    username: usernameDto,
    email: emailDto,
    password: passwordDto,
    bio: bioDto.optional(), // Optional
    avatarUrl: avatarUrlDto.optional() // Optional
});