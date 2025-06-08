import * as zod from "zod";
import { userRoleDto } from "./user.dto";

export const changeRoleDto = zod.object({
  newRole: userRoleDto,
});
