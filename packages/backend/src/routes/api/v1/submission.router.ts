import { Router } from "express";
import { SubmissionControllerInstance } from "../../../controllers/submission.controller";
import { parseUserHeaders } from "../../../middlewares/parseUserHeaders.middleware";
import {
  getBodyValidationMiddleware,
  getQueryValidationMiddleware,
} from "../../../middlewares/validation.middleware";
import {
  CreateSubmissionRequestDto,
  GetSubmissionsQueryDto,
  UpdateSubmissionRequestDto,
} from "../../../dtos/submission.dto";

export const SubmissionRouter: Router = Router();

/**
 * @swagger
 * /api/v1/submissions:
 *   post:
 *     summary: "Create a new code submission"
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               problem_id:
 *                 type: string
 *                 format: uuid
 *                 description: "UUID of the problem being submitted"
 *               language:
 *                 type: string
 *                 enum: [Python, Cpp]
 *                 description: "Programming language used"
 *               submission_key:
 *                 type: string
 *                 description: "Azure Blob Storage key for the submitted code file"
 *             required:
 *               - problem_id
 *               - language
 *               - submission_key
 *     responses:
 *       201:
 *         description: "Submission created and queued for execution successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Submission created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     submission_id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [Queued, Compile Error, Runtime Error, Time Limit Error, Wrong Answer, Successful, Server Error]
 *                       example: "Queued"
 *       400:
 *         description: "Invalid request body (validation error)"
 *       401:
 *         description: "Unauthorized (missing or invalid access token)"
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
 *     summary: "Get submissions with optional filters and pagination"
 *     tags: [Submissions]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *           description: "Filter by user ID"
 *       - in: query
 *         name: problem_id
 *         schema:
 *           type: string
 *           format: uuid
 *           description: "Filter by problem ID"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: "Page number for pagination"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *           description: "Number of submissions per page"
 *     produces:
 *       - "application/json"
 *     responses:
 *       200:
 *         description: "Submissions fetched successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Submissions fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalSubmissions:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 */
SubmissionRouter.get(
  "/",
  getQueryValidationMiddleware(GetSubmissionsQueryDto),
  SubmissionControllerInstance.getSubmissions,
);

/**
 * @swagger
 * /api/v1/submissions/{submissionId}:
 *   get:
 *     summary: "Get a submission by ID"
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *           description: "ID of the submission to fetch"
 *     produces:
 *       - "application/json"
 *     responses:
 *       200:
 *         description: "Submission fetched successfully"
 *       404:
 *         description: "Submission not found"
 */
SubmissionRouter.get("/:submissionId", SubmissionControllerInstance.getSubmissionById);

/**
 * @swagger
 * /api/v1/submissions:
 *   patch:
 *     summary: "Update a submission result (called by execution worker)"
 *     tags: [Submissions]
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submission_id:
 *                 type: integer
 *                 description: "ID of the submission to update"
 *               status:
 *                 type: string
 *                 enum: [Queued, Compile Error, Runtime Error, Time Limit Error, Wrong Answer, Successful, Server Error]
 *                 description: "Execution result status"
 *               runtime:
 *                 type: number
 *                 description: "Runtime in milliseconds"
 *               memory_used:
 *                 type: number
 *                 description: "Memory used in megabytes"
 *               test_cases_passed:
 *                 type: integer
 *                 description: "Number of test cases passed"
 *               total_test_cases:
 *                 type: integer
 *                 description: "Total number of test cases"
 *               error_message:
 *                 type: string
 *                 description: "Error message if execution failed"
 *               executed_at:
 *                 type: string
 *                 format: date-time
 *                 description: "Execution timestamp"
 *             required:
 *               - submission_id
 *               - status
 *     responses:
 *       200:
 *         description: "Submission updated successfully"
 *       400:
 *         description: "Invalid request body (validation error)"
 *       404:
 *         description: "Submission not found"
 */
SubmissionRouter.patch(
  "/",
  getBodyValidationMiddleware(UpdateSubmissionRequestDto),
  SubmissionControllerInstance.updateSubmission,
);
