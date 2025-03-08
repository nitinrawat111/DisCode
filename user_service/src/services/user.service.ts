import { dbPool } from "../config/db.js";
import { userIdSchema, userLoginSchema, userRegistrationSchema, userUpdateSchema } from "../schemas/users.schema.js";
import bcrypt from 'bcrypt';
import ApiError from "../utils/ApiError.js";
import zod from 'zod';
import { isDuplicateKeyError } from "../utils/postgres.js";

// Namespace for user controllers
const userService = {
    register: async function (newUserDetails: zod.infer<typeof userRegistrationSchema>) {
        // Validate Request Body
        const newUser = userRegistrationSchema.parse(newUserDetails);

        // Hash the password
        const passwordHash = await bcrypt.hash(newUser.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '8'));

        try {
            await dbPool.query(
                'INSERT INTO USERS VALUES (DEFAULT, $1, $2, $3, DEFAULT, $4, $5, DEFAULT)', 
                [
                    newUser.username,
                    newUser.email,
                    passwordHash,
                    newUser.bio,
                    newUser.avatarUrl,
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
    },

    login: async function (userLoginDetails: zod.infer<typeof userLoginSchema>) {
        // Validate request body
        const { email, password } = userLoginSchema.parse(userLoginDetails);

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
    },

    getUserProfile: async function (userId: string | undefined) {
        // Validate user id 
        userId = userIdSchema.parse(userId);
        
        const queryResult = await dbPool.query(
            `SELECT * FROM USERS WHERE user_id=$1`,
            [ userId ]
        );
        const user = queryResult.rows?.[0];
        if(!user)
            throw new ApiError(404, "User not found");

        // Removing sensitive fields
        delete user.password_hash;
        return user;
    },

    updateProfile: async function (userId: string | undefined, updatedUserDetails: zod.infer<typeof userUpdateSchema>) {
        // Validate request body and userId
        userId = userIdSchema.parse(userId);
        updatedUserDetails = userUpdateSchema.parse(updatedUserDetails);

        try {
            await dbPool.query(
                `UPDATE USERS 
                SET username = COALESCE($1, username),
                    bio = COALESCE($2, bio),
                    avatar_url = COALESCE($3, avatar_url)
                WHERE user_id = $4`,
                [updatedUserDetails.username, updatedUserDetails.bio, updatedUserDetails.avatarUrl, userId]
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
}

export default userService;