import { dbPool } from "../config/db";
import { userIdDto, UserRoleEnum } from "../dtos/user.dto";
import * as bcrypt from 'bcrypt';
import ApiError from "../utils/ApiError";
import zod from 'zod';
import { isDuplicateKeyError } from "../utils/postgres";
import { BCRYPT_SALT_ROUNDS } from "../constants";
import { UserJWTPayload } from "../types/types";
import { objKeysToCamelCase } from "../utils/camelCase";
import { userLoginDto } from "../dtos/login.dto";
import { userRegistrationDto } from "../dtos/register.dto";
import { userUpdateDto } from "../dtos/update-profile.dto";
import { changeRoleDto } from "../dtos/change-role.dto";

export class UserService {
    private roleRanks: Record<UserRoleEnum, number> = {
        superadmin: 3,
        admin: 2,
        moderator: 1,
        normal: 0,
    };

    async register (newUserDetails: zod.infer<typeof userRegistrationDto>) {
        // Validate Request Body
        const validatedNewUser = userRegistrationDto.parse(newUserDetails);

        // Hash the password
        const passwordHash = await bcrypt.hash(validatedNewUser.password, parseInt(BCRYPT_SALT_ROUNDS.toString()));

        try {
            await dbPool.query(
                'INSERT INTO USERS VALUES (DEFAULT, $1, $2, $3, DEFAULT, $4, $5, DEFAULT)', 
                [
                    validatedNewUser.username,
                    validatedNewUser.email,
                    passwordHash,
                    validatedNewUser.bio,
                    validatedNewUser.avatarUrl,
                ]
            );
        } catch (err: any) {
            if(isDuplicateKeyError(err)) {
                if(err.constraint == "users_email_key")
                    throw new ApiError(409, "Email already exists");

                if(err.constraint == "users_username_key")
                    throw new ApiError(409, "Username already exists");
            }
            throw err;
        }
    };

    async login (userLoginDetails: zod.infer<typeof userLoginDto>) {
        // Validate request body
        const { email, password } = userLoginDto.parse(userLoginDetails);

        const queryResult = await dbPool.query(
            `SELECT user_id, email, password_hash FROM USERS WHERE email=$1`,
            [ email ]
        );
        const user = queryResult.rows?.[0];

        if(!user)
            throw new ApiError(404, "Email not found");

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if(!isPasswordCorrect)
            throw new ApiError(401, "Incorrect Password");

        const payload: UserJWTPayload = {
            userId: user.user_id,
            role: user.role
        }
        return payload;
    };

    async getUserProfile(userId: zod.infer<typeof userIdDto>) {
        // Validate user id 
        const validatedUserId = userIdDto.parse(userId);
        
        const queryResult = await dbPool.query(
            `SELECT * FROM USERS WHERE user_id=$1`,
            [ validatedUserId ]
        );
        const user = queryResult.rows?.[0];
        if(!user)
            throw new ApiError(404, "User not found");

        // Removing sensitive fields
        delete user.password_hash;
        return objKeysToCamelCase(user);
    };

    async updateProfile(userId: zod.infer<typeof userIdDto>, updatedUserDetails: zod.infer<typeof userUpdateDto>) {
        // Assuming userId is coming from JWT, hence it will be valid
        // Validate request body
        const validatedUpdates = userUpdateDto.parse(updatedUserDetails);

        try {
            await dbPool.query(
                `UPDATE USERS SET username = COALESCE($1, username), bio = COALESCE($2, bio), avatar_url = COALESCE($3, avatar_url) WHERE user_id = $4`,
                [validatedUpdates.username, validatedUpdates.bio, validatedUpdates.avatarUrl, userId]
            );
        } catch (err: any) {
            // If error is related to inserting a duplicate key in unique field
            if(isDuplicateKeyError(err)) {
                if(err.constraint == "users_username_key")
                    throw new ApiError(409, "Username already exists");
            }
            throw err;
        }
    }

    async getUserRole(userId: zod.infer<typeof userIdDto>) {
        const validatedUserId = userIdDto.parse(userId);

        const queryResult = await dbPool.query(
            `SELECT role FROM users where user_id = $1`,
            [validatedUserId]
        );
        
        if(queryResult.rowCount == 0) {
            throw new ApiError(404, "UserId not found");
        }

        return queryResult.rows[0].role as UserRoleEnum;
    }

    async changeRole(targetUserId: zod.infer<typeof userIdDto>, changeRoleDetails: zod.infer<typeof changeRoleDto>, changerId: zod.infer<typeof userIdDto>) {
        // Assuming changerId is coming from jwt. So, it exists and is valid;
        const validatedTargetUserId = userIdDto.parse(targetUserId);
        const { newRole } = changeRoleDto.parse(changeRoleDetails);

        // If the targetUserId does not exist, error will be thrown in this call itself
        const [ changerRole,  targetUserCurrentRole] = await Promise.all([ await this.getUserRole(changerId), await this.getUserRole(validatedTargetUserId) ]);
        
        if(changerRole !== UserRoleEnum.SUPERADMIN && this.roleRanks[targetUserCurrentRole] >= this.roleRanks[changerRole]) {
            throw new ApiError(403, "You do not have permission to modify this user's role");
        }

        if(changerRole !== UserRoleEnum.SUPERADMIN && this.roleRanks[newRole] >= this.roleRanks[changerRole]) {
            throw new ApiError(403, "You do not have permission to assign this role");
        }

        const queryResult = await dbPool.query(
            `UPDATE users SET role = $1 where user_id = $2`,
            [newRole, validatedTargetUserId]
        );
    }
}

export const userServiceInstance = new UserService();