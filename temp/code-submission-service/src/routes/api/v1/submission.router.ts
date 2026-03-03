import * as express from "express";
import { submissionControllerInstance } from "../../../controllers/submission.controller";
import * as asyncHandler from "express-async-handler";
import { parseUserHeaders } from "../../../middlewares/parseUserHeaders.middleware";

const router = express.Router();

/**
 * @swagger
 * /api/v1/submissions:
 *   post:
 *     summary: "Create a new submission"
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
 *               problemId:
 *                 type: string
 *                 format: uuid
 *                 description: "ID of the problem being submitted"
 *               language:
 *                 type: string
 *                 description: "Programming language used"
 *               submissionKey:
 *                 type: string
 *                 description: "Unique key for the submission"
 *             required:
 *               - problemId
 *               - language
 *               - submissionKey
 *     responses:
 *       201:
 *         description: "Submission created successfully"
 *       400:
 *         description: "Invalid request body"
 */
router.post(
  "/",
  parseUserHeaders,
  asyncHandler(submissionControllerInstance.createSubmission),
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
 *     responses:
 *       200:
 *         description: "Submission fetched successfully"
 *       404:
 *         description: "Submission not found"
 */
router.get(
  "/:submissionId",
  asyncHandler(submissionControllerInstance.getSubmissionById),
);

/**
 * @swagger
 * /api/v1/submissions:
 *   get:
 *     summary: "Get submissions with optional filters"
 *     tags: [Submissions]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           description: "Filter by user ID"
 *       - in: query
 *         name: problemId
 *         schema:
 *           type: string
 *           format: uuid
 *           description: "Filter by problem ID"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           description: "Page number for pagination"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           description: "Number of submissions per page"
 *     responses:
 *       200:
 *         description: "Submissions fetched successfully"
 */
router.get("/", asyncHandler(submissionControllerInstance.getSubmissions));

/**
 * @swagger
 * /api/v1/submissions:
 *   patch:
 *     summary: "Update a submission"
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
 *               submissionId:
 *                 type: integer
 *                 description: "ID of the submission to update"
 *               status:
 *                 type: string
 *                 description: "New status of the submission"
 *               runtime:
 *                 type: number
 *                 description: "Runtime of the submission"
 *               memoryUsed:
 *                 type: number
 *                 description: "Memory used by the submission"
 *               testCasesPassed:
 *                 type: integer
 *                 description: "Number of test cases passed"
 *               totalTestCases:
 *                 type: integer
 *                 description: "Total number of test cases"
 *               errorMessage:
 *                 type: string
 *                 description: "Error message, if any"
 *               executedAt:
 *                 type: string
 *                 format: date-time
 *                 description: "Execution timestamp"
 *             required:
 *               - submissionId
 *     responses:
 *       200:
 *         description: "Submission updated successfully"
 *       404:
 *         description: "Submission not found"
 */
router.patch("/", asyncHandler(submissionControllerInstance.updateSubmission));

export default router;
