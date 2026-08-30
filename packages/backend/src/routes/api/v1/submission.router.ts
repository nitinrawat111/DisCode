import { Router } from "express";
import { SubmissionControllerInstance } from "../../../controllers/submission.controller";
import {
  CreateSubmissionRequestDto,
  GetSubmissionsFilterQueryDto,
} from "../../../dtos/submission.dto";
import { parseUserHeaders } from "../../../middlewares/parseUserHeaders.middleware";
import {
  getBodyValidationMiddleware,
  getQueryValidationMiddleware,
} from "../../../middlewares/validation.middleware";

export const SubmissionRouter: Router = Router();

SubmissionRouter.post(
  "/",
  parseUserHeaders,
  getBodyValidationMiddleware(CreateSubmissionRequestDto),
  SubmissionControllerInstance.createSubmission,
);

SubmissionRouter.get(
  "/",
  parseUserHeaders,
  getQueryValidationMiddleware(GetSubmissionsFilterQueryDto),
  SubmissionControllerInstance.getSubmissions,
);
