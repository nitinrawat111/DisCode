import { JWTPayload } from "jose";
import { User } from "../models/user.model";

// TODO: Add reference and context
export interface JWKSPrivateKey {
  key: CryptoKey;
  kid: string;
}

export interface UserJWTPayload extends JWTPayload {
  userId: User["user_id"];
}
