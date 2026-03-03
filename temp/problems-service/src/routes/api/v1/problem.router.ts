import * as express from "express";
import * as asyncHandler from "express-async-handler";
import { problemControllerInstance } from "../../../controllers/problem.controller";
import { UserRoleEnum } from "../../../dtos/user.dto";
import { parseUserHeaders } from "../../../middlewares/parseUserHeaders.middleware";
import { verifyUserRole } from "../../../middlewares/verifyUserRole.middleware";

const router = express.Router();

router.get(
  "/:problemId",
  asyncHandler(problemControllerInstance.getProblemById),
);
router.get("/", asyncHandler(problemControllerInstance.getProblems));

////////////////////////////////////////////////////////////////////////////
// PROTECTED ROUTES BELOW: Require moderator/admin/superadmin roles
////////////////////////////////////////////////////////////////////////////
router.use(
  parseUserHeaders,
  verifyUserRole([
    UserRoleEnum.MODERATOR,
    UserRoleEnum.ADMIN,
    UserRoleEnum.SUPERADMIN,
  ]),
);
router.post("/", asyncHandler(problemControllerInstance.createProblem));
router.patch(
  "/:problemId",
  asyncHandler(problemControllerInstance.updateProblem),
);

export default router;
