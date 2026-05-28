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

/**
 * @swagger
 * /api/v1/submissions:
 *   post:
 *     summary: "Create a new code submission"
 *     tags: [Submissions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               problem_id:
 *                 type: string
 *                 description: "Target problem ID"
 *               language:
 *                 type: string
 *                 description: "Programming language"
 *               submission_key:
 *                 type: string
 *                 description: "Blob/object storage key of submitted code"
 *             required:
 *               - problem_id
 *               - language
 *               - submission_key
 *     responses:
 *       201:
 *         description: "Submission created successfully"
 *       401:
 *         description: "Unauthorized"
 *       404:
 *         description: "Problem not found"
 */
SubmissionRouter.post(
  "/",
  parseUserHeaders,
  getBodyValidationMiddleware(CreateSubmissionRequestDto),
  SubmissionControllerInstance.createSubmission,
);

/**
 * @swagger
 * /api/v1/submissions:
 *   get:
 *     summary: "Get submissions by problemId or userId"
 *     tags: [Submissions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: problemId
 *         schema:
 *           type: string
 *         description: "Provide exactly one of problemId or userId"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: "Provide exactly one of problemId or userId"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [queued, compile_error, runtime_error, time_limit_exceeded, wrong_answer, successful, server_error]
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Submissions fetched successfully"
 *       401:
 *         description: "Unauthorized"
 */
SubmissionRouter.get(
  "/",
  parseUserHeaders,
  getQueryValidationMiddleware(GetSubmissionsFilterQueryDto),
  SubmissionControllerInstance.getSubmissions,
);
