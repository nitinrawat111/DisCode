import zod from "zod";
import { usernameDto, bioDto, avatarUrlDto } from "./user.dto";

export const userUpdateDto = zod.object({
  username: usernameDto.optional(),
  bio: bioDto.optional(),
  avatarUrl: avatarUrlDto.optional(),
});
