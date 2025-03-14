import zod from 'zod';
import { emailDto, passwordDto } from './users.dto';

export const userLoginDto = zod.object({
    email: emailDto,
    password: passwordDto
});