import * as zod from 'zod';
import { userRoleDto } from './users.dto';

export const changeRoleDto = zod.object({
    newRole: userRoleDto
});