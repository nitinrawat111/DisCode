type UserRole = "normal" | "moderator" | "admin";

interface UserJWTPayload  {
    userId: string,
    role: UserRole
}

namespace Express {
    interface Request {
        user?: UserJWTPayload
    }
}