import { JWTPayload } from "jose";
import { User, UserRole } from "./db";

export interface JWKSPrivateKey {
  key: CryptoKey;
  kid: string;
}

export interface UserJWTPayload extends JWTPayload {
  userId: User["user_id"];
  role: UserRole;
}
