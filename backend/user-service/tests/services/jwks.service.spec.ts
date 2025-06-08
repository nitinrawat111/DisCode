import { expect } from "chai";
import { JWKSService } from "../../src/services/jwks.service";
import { UserJWTPayload } from "../../src/types/types";
import { UserRoleEnum } from "../../src/dtos/user.dto";

describe("JWKSService - Integration Tests", () => {
  let jwksService: JWKSService;

  beforeEach(async () => {
    jwksService = new JWKSService();
    await jwksService.waitForInit();
  });

  describe("initialization", () => {
    it("should initialize with at least one key", () => {
      const jwks = jwksService.getJwks();
      expect(jwks).to.have.property("keys");
      expect(jwks.keys).to.be.an("array");
      expect(jwks.keys.length).to.be.at.least(1);
    });
  });

  describe("JWT operations", () => {
    it("should sign and verify a JWT token", async () => {
      const payload: UserJWTPayload = {
        userId: 123,
        role: UserRoleEnum.NORMAL,
      };

      // Sign a JWT
      const token = await jwksService.signJWT(payload);
      expect(token).to.be.a("string");
      expect(token.split(".").length).to.equal(3); // JWT format check: header.payload.signature

      // Verify the JWT
      const verified = await jwksService.verifyJWT(token);
      expect(verified).to.have.property("userId", payload.userId);
      expect(verified).to.have.property("role", payload.role);
    });

    it("should throw an error for invalid JWT", async () => {
      const invalidToken = "invalid.jwt.token";

      try {
        await jwksService.verifyJWT(invalidToken);
        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal("Jwt Verification Failed");
      }
    });
  });

  describe("Key rotation", () => {
    it("should add a new key", async () => {
      const initialCount = jwksService.getJwks().keys.length;

      // Use the private method through type assertion
      await (jwksService as any).addNewKey();

      const newCount = jwksService.getJwks().keys.length;
      expect(newCount).to.equal(initialCount + 1);
    });

    it("should remove the oldest key when there are multiple keys", async () => {
      // Make sure we have at least 2 keys
      if (jwksService.getJwks().keys.length < 2) {
        await (jwksService as any).addNewKey();
      }

      const initialCount = jwksService.getJwks().keys.length;
      const oldestKeyId = jwksService.getJwks().keys[0].kid;

      // Call the private removeExpiredKey method
      (jwksService as any).removeExpiredKey();

      const newCount = jwksService.getJwks().keys.length;
      expect(newCount).to.equal(initialCount - 1);

      // Verify the oldest key was removed
      const remainingKeyIds = jwksService.getJwks().keys.map((key) => key.kid);
      expect(remainingKeyIds).to.not.include(oldestKeyId);
    });

    it("should not remove the only key", async () => {
      // First, remove all but one key
      while (jwksService.getJwks().keys.length > 1) {
        (jwksService as any).removeExpiredKey();
      }

      const initialCount = jwksService.getJwks().keys.length;
      expect(initialCount).to.equal(1);

      // Try to remove the only key
      (jwksService as any).removeExpiredKey();

      // Verify the key was not removed
      const newCount = jwksService.getJwks().keys.length;
      expect(newCount).to.equal(1);
    });
  });
});
