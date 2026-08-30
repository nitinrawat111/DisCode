import { Router } from "express";
import { UserRole } from "../../../models/user.model";
import { ProblemControllerInstance } from "../../../controllers/problem.controller";
import {
  CreateProblemRequestDto,
  GetProblemsQueryDto,
  UpdateProblemRequestDto,
} from "../../../dtos/problem.dto";
import { requireRoles } from "../../../middlewares/authorization.middleware";
import { parseUserHeaders } from "../../../middlewares/parseUserHeaders.middleware";
import {
  getBodyValidationMiddleware,
  getQueryValidationMiddleware,
} from "../../../middlewares/validation.middleware";

export const ProblemRouter: Router = Router();
export type ProblemIdParam = {
  problemId: string;
};

ProblemRouter.post(
  "/",
  parseUserHeaders,
  requireRoles([UserRole.Moderator, UserRole.Admin, UserRole.SuperAdmin]),
  getBodyValidationMiddleware(CreateProblemRequestDto),
  ProblemControllerInstance.createProblem,
);

ProblemRouter.get("/:problemId", ProblemControllerInstance.getProblemById);

ProblemRouter.get(
  "/",
  getQueryValidationMiddleware(GetProblemsQueryDto),
  ProblemControllerInstance.getProblems,
);

ProblemRouter.patch(
  "/:problemId",
  parseUserHeaders,
  requireRoles([UserRole.Moderator, UserRole.Admin, UserRole.SuperAdmin]),
  getBodyValidationMiddleware(UpdateProblemRequestDto),
  ProblemControllerInstance.updateProblem,
);

ProblemRouter.delete(
  "/:problemId",
  parseUserHeaders,
  requireRoles([UserRole.Moderator, UserRole.Admin, UserRole.SuperAdmin]),
  ProblemControllerInstance.deleteProblem,
);
