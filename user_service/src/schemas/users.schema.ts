import zod from 'zod';

const usernameSchema = zod.string().max(30);
const emailSchema = zod.string().email();
const passwordSchema = zod.string().min(8);
const bioSchema = zod.string();
const avatarUrlSchema = zod.string();

export const userIdSchema = zod.string().uuid("Invalid User Id");

// Schema for request body when adding a new user
export const userRegistrationSchema = zod.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    bio: bioSchema.optional(), // Optional
    avatarUrl: avatarUrlSchema.optional() // Optional
});

// Schema for request body when logging in 
export const userLoginSchema = zod.object({
    email: emailSchema,
    password: passwordSchema
});

// Schema for request body when updating profile
export const userUpdateSchema = zod.object({
    username: usernameSchema.optional(),
    bio: bioSchema.optional(),
    avatarUrl: avatarUrlSchema.optional()
});