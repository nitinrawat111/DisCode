import zod from 'zod';

export enum UserRoleEnum {
    SUPERADMIN = 'superadmin',
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    NORMAL = 'normal'
}

export const userIdDto = zod.number().int().positive();
export const userRoleDto = zod.enum(Object.values(UserRoleEnum) as [string, ...string[]]);