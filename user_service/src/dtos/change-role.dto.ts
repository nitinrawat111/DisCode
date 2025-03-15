import * as zod from 'zod';
import { userIdDto, userRoleDto } from './users.dto';

export const changeRoleDto = zod.object({
    newRole: userRoleDto
});