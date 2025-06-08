import {
  createLocalJWKSet,
  exportJWK,
  FlattenedJWSInput,
  generateKeyPair,
  importJWK,
  JWSHeaderParameters,
  jwtVerify,
  SignJWT,
} from "jose";
import { JWKS, JWKSPrivateKey, UserJWTPayload } from "../types/types";
import * as cron from "node-cron";
import { v4 as uuidv4 } from "uuid";
import { ACCESS_TOKEN_EXPIRATION_TIME } from "../constants";

export class JWKSService {
  private initPromise: Promise<void>;
  private readonly algorithm = "RS256";
  private privateKeys: JWKSPrivateKey[] = [];
  private jwks: JWKS = { keys: [] };
  private async getPublicKey(
    protectedHeader?: JWSHeaderParameters,
    token?: FlattenedJWSInput,
  ): Promise<CryptoKey> {
    return new CryptoKey();
  }

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    await this.addNewKey();
    this.getPublicKey = createLocalJWKSet(this.jwks);
    this.setupKeyRotationJobs();

    // Clear the promise once init is successful
    this.initPromise = null;
  }

  public waitForInit(): Promise<void> {
    return this.initPromise;
  }

  private async addNewKey() {
    const { publicKey, privateKey } = await generateKeyPair(this.algorithm);
    const kid = uuidv4(); // Generate a unique key ID

    const jwk = await exportJWK(publicKey);
    jwk.kid = kid;

    this.jwks.keys.push(jwk);
    this.privateKeys.push({ key: privateKey, kid });
  }

  private removeExpiredKey() {
    if (this.jwks.keys.length > 1) {
      const removedKey = this.jwks.keys.shift();
      this.privateKeys.shift();
    }
  }

  private setupKeyRotationJobs() {
    // Adds a new key every 24 hours
    cron.schedule("0 0 * * *", async () => {
      await this.addNewKey();
    });

    // Removes the oldest key every 7 days
    cron.schedule("0 0 * * 0", async () => {
      this.removeExpiredKey();
    });
  }

  public getJwks(): JWKS {
    return this.jwks;
  }

  public async signJWT(payload: UserJWTPayload) {
    if (this.privateKeys.length === 0) {
      throw new Error("No available signing key.");
    }

    const latestPrivateKey = this.privateKeys[this.privateKeys.length - 1];

    return new SignJWT(payload)
      .setProtectedHeader({ alg: this.algorithm, kid: latestPrivateKey.kid })
      .setExpirationTime(Date.now() + ACCESS_TOKEN_EXPIRATION_TIME)
      .sign(latestPrivateKey.key);
  }

  public async verifyJWT(jwt: string) {
    try {
      const { payload } = await jwtVerify(jwt, this.getPublicKey);
      return payload as UserJWTPayload;
    } catch (err) {
      throw new Error("Jwt Verification Failed");
    }
  }
}

export const jwksServiceInstance = new JWKSService();
