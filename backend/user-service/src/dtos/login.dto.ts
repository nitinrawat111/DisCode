import zod from "zod";
import { emailDto, passwordDto } from "./user.dto";

export const userLoginDto = zod.object({
  email: emailDto,
  password: passwordDto,
});
