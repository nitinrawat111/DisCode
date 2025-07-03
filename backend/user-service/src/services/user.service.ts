import { DB } from "../db/db";
import { BCRYPT_SALT_ROUNDS } from "../constants";
import {
  ChangeRoleRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "../dtos/user.dto";
import { compare, hash } from "bcrypt";
import { User, UserRole } from "../types/db";
import { isDuplicateKeyError } from "../utils/postgres";
import { ApiError } from "../utils/ApiError";
import { UserJWTPayload } from "../types";

export class UserService {
  private static readonly roleRanks: Record<UserRole, number> = {
    superadmin: 3,
    admin: 2,
    moderator: 1,
    normal: 0,
  };

  async register(registerRequest: RegisterRequest) {
    // Hash the password
    const passwordHash = await hash(
      registerRequest.password,
      BCRYPT_SALT_ROUNDS,
    );

    try {
      await DB.insertInto("users")
        .values({
          username: registerRequest.username,
          email: registerRequest.email,
          password_hash: passwordHash,
          bio: registerRequest.bio,
          avatar_url: registerRequest.avatar_url,
          role: UserRole.Normal, // Default role for new users
        })
        .execute();
    } catch (err: unknown) {
      if (isDuplicateKeyError(err) === true) {
        // Constraint is of the format "table_column_key"
        if (err.constraint == "users_email_key")
          throw new ApiError(409, "Email already exists");

        if (err.constraint == "users_username_key")
          throw new ApiError(409, "Username already exists");
      }
      throw err;
    }
  }

  async login(loginRequest: LoginRequest) {
    const user = await DB.selectFrom("users")
      .selectAll()
      .where("email", "=", loginRequest.email)
      .executeTakeFirst();
    if (typeof user === "undefined") {
      throw new ApiError(404, "Email not found");
    }

    const isPasswordCorrect = await compare(
      loginRequest.password,
      user.password_hash,
    );
    if (isPasswordCorrect === false) {
      throw new ApiError(401, "Incorrect Password");
    }

    const jwtPayload: UserJWTPayload = {
      userId: user.user_id,
      role: user.role,
    };
    return jwtPayload;
  }

  async getUserProfile(userId: User["user_id"]) {
    const user = await DB.selectFrom("users")
      .select([
        // Everything except password_hash
        "user_id",
        "username",
        "email",
        "bio",
        "avatar_url",
        "role",
        "created_at",
      ])
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (typeof user === "undefined") {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async updateProfile(
    userId: User["user_id"],
    updatedUserDetails: UpdateProfileRequest,
  ) {
    try {
      await DB.updateTable("users")
        .set({
          // If we pass null here, existing values will be overwritten by null
          // Setting them as undefined so that they are not included in the query itself
          username: updatedUserDetails.username ?? undefined,
          bio: updatedUserDetails.bio ?? undefined,
          avatar_url: updatedUserDetails.avatar_url ?? undefined,
        })
        .where("user_id", "=", userId)
        .execute();
    } catch (err: unknown) {
      // If error is related to inserting a duplicate key in unique field
      if (isDuplicateKeyError(err)) {
        if (err.constraint == "users_username_key")
          throw new ApiError(409, "Username already exists");
      }
      throw err;
    }
  }

  async getUserRole(userId: User["user_id"]) {
    const user = await DB.selectFrom("users")
      .select("role")
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (typeof user === "undefined") {
      throw new ApiError(404, "UserId not found");
    }

    return user.role;
  }

  async changeRole(
    targetUserId: User["user_id"],
    changerId: User["user_id"],
    changeRoleRequest: ChangeRoleRequest,
  ) {
    // TODO: Do we really need to check for changerId here??
    // It will be coming from jwt and will be valid
    // We can take changerId and role from jwt.
    // Maybe refactor this later

    const [changerRole, targetUserCurrentRole] = await Promise.all([
      await this.getUserRole(changerId),
      await this.getUserRole(targetUserId),
    ]);

    if (
      UserService.roleRanks[targetUserCurrentRole] >=
      UserService.roleRanks[changerRole]
    ) {
      throw new ApiError(
        403,
        "You do not have permission to modify this user's role",
      );
    }

    if (
      UserService.roleRanks[changeRoleRequest.new_role] >=
      UserService.roleRanks[changerRole]
    ) {
      throw new ApiError(
        403,
        "You do not have permission to assign this role to the user",
      );
    }

    await DB.updateTable("users")
      .set({
        role: changeRoleRequest.new_role,
      })
      .where("user_id", "=", targetUserId)
      .execute();
  }
}

export const UserServiceInstance = new UserService();
