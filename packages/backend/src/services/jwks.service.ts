import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  JSONWebKeySet,
  jwtVerify,
  SignJWT,
} from "jose";
import { JWKSPrivateKey, UserJWTPayload } from "../types";
import { schedule } from "node-cron";
import { v4 as uuidv4 } from "uuid";
import { ACCESS_TOKEN_EXPIRATION_TIME } from "../constants";

export class JWKSService {
  private static readonly algorithm = "RS256";
  private initPromise: Promise<void>;
  private privateKeys: JWKSPrivateKey[] = [];
  private jwks: JSONWebKeySet = { keys: [] };
  private getPublicKey: ReturnType<typeof createLocalJWKSet>;

  constructor() {
    this.setupKeyRotationJobs();
    this.initPromise = this.init();
  }

  private async init() {
    await this.addNewKey();
    this.getPublicKey = createLocalJWKSet(this.jwks);

    // Clear the promise once init is successful
    this.initPromise = null;
  }

  private async addNewKey() {
    const { publicKey, privateKey } = await generateKeyPair(
      JWKSService.algorithm,
    );
    const kid = uuidv4(); // Generate a unique key ID

    this.privateKeys.push({ key: privateKey, kid });

    const jwk = await exportJWK(publicKey);
    jwk.kid = kid;
    this.jwks.keys.push(jwk);
  }

  private removeExpiredKey() {
    // Make sure we don't remove all keys
    if (this.jwks.keys.length > 1) {
      this.jwks.keys.shift();
      this.privateKeys.shift();
    }
  }

  private setupKeyRotationJobs() {
    // Adds a new key every 24 hours
    schedule("0 0 * * *", async () => {
      await this.addNewKey();
    });

    // Removes the oldest key every 7 days
    schedule("0 0 * * 0", async () => {
      this.removeExpiredKey();
    });
  }

  public waitForInit(): Promise<void> {
    return this.initPromise;
  }

  public getJwks(): JSONWebKeySet {
    return this.jwks;
  }

  public async signJWT(payload: UserJWTPayload) {
    if (this.privateKeys.length === 0) {
      throw new Error("No available signing key.");
    }

    const latestPrivateKey = this.privateKeys[this.privateKeys.length - 1];

    return new SignJWT(payload)
      .setProtectedHeader({
        alg: JWKSService.algorithm,
        kid: latestPrivateKey.kid,
      })
      .setExpirationTime(Date.now() + ACCESS_TOKEN_EXPIRATION_TIME)
      .sign(latestPrivateKey.key);
  }

  public async verifyJWT(jwt: string) {
    try {
      const { payload } = await jwtVerify<UserJWTPayload>(
        jwt,
        this.getPublicKey,
      );
      return payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error("Jwt Verification Failed");
    }
  }
}

export const JwksServiceInstance = new JWKSService();
