import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { UserController } from "../../src/controllers/user.controller";
import {
  UserService,
  userServiceInstance,
} from "../../src/services/user.service";
import { jwksServiceInstance } from "../../src/services/jwks.service";
import ApiResponse from "../../src/utils/ApiResponse";
import { UserRoleEnum } from "../../src/dtos/user.dto";

// Enable chai-as-promised
use(chaiAsPromised);

describe("UserController - Unit Tests", () => {
  let userController: UserController;
  let userServiceStub: sinon.SinonStubbedInstance<UserService>;
  let jwksServiceStub: sinon.SinonStubbedInstance<any>;
  let res: any;

  beforeEach(() => {
    userController = new UserController();
    userServiceStub = sinon.stub(userServiceInstance);
    jwksServiceStub = sinon.stub(jwksServiceInstance);
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      cookie: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
      setHeader: sinon.stub().returnsThis(), // Added setHeader stub
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("register", () => {
    it("should register user and return success response", async () => {
      userServiceStub.register.resolves();

      await userController.register({ body: {} } as any, res, () => {});
      expect(res.status.calledWith(201)).to.be.true;
      expect(
        res.json.calledWith(new ApiResponse(201, "Succesfully registered")),
      ).to.be.true;
    });
  });

  describe("getUserProfile", () => {
    it("should fetch user profile and return success response", async () => {
      const userProfile = { userId: 1, username: "john_doe" };
      userServiceStub.getUserProfile.resolves(userProfile);

      await userController.getUserProfile(
        { params: { userId: "1" } } as any,
        res,
        () => {},
      );
      expect(userServiceStub.getUserProfile.calledWith(1)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith(
          new ApiResponse(
            200,
            "User Profile fetched successfully",
            userProfile,
          ),
        ),
      ).to.be.true;
    });
  });

  describe("login", () => {
    it("should login user, set Authorization header, and return success response", async () => {
      const payload = { userId: 1, role: UserRoleEnum.NORMAL };
      userServiceStub.login.resolves(payload);
      jwksServiceStub.signJWT.resolves("mock-token");

      await userController.login({ body: {} } as any, res, () => {});
      expect(userServiceStub.login.calledOnce).to.be.true;
      expect(jwksServiceStub.signJWT.calledWith(payload)).to.be.true;
      expect(res.setHeader.calledWith("Authorization", "mock-token")).to.be
        .true; // Updated to check Authorization header
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith(new ApiResponse(200, "Logged in successfully")),
      ).to.be.true;
    });
  });

  describe("getLoggedUserProfile", () => {
    it("should fetch logged-in user profile", async () => {
      const userProfile = { userId: 1, username: "john_doe" };
      userServiceStub.getUserProfile.resolves(userProfile);

      await userController.getLoggedUserProfile(
        { user: { userId: 1 } } as any,
        res,
        () => {},
      );
      expect(userServiceStub.getUserProfile.calledWith(1)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith(
          new ApiResponse(
            200,
            "User Profile fecthed successfully",
            userProfile,
          ),
        ),
      ).to.be.true;
    });
  });

  describe("updateProfile", () => {
    it("should update user profile and return success response", async () => {
      userServiceStub.updateProfile.resolves();

      await userController.updateProfile(
        { user: { userId: 1 }, body: {} } as any,
        res,
        () => {},
      );
      expect(userServiceStub.updateProfile.calledWith(1, {})).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith(
          new ApiResponse(200, "User Profile updated successfully"),
        ),
      ).to.be.true;
    });
  });
});
