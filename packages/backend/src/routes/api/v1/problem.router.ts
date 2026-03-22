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

/**
 * @swagger
 * /api/v1/problems:
 *   post:
 *     summary: "Create a new problem"
 *     tags: [Problems]
 *     security:
 *       - cookieAuth: []
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
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: "Problem title"
 *               markdown_key:
 *                 type: string
 *                 description: "S3 key for problem statement markdown"
 *               test_keys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Array of S3 keys for test cases"
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: "Problem difficulty level"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *                 description: "Problem tags (optional)"
 *             required:
 *               - title
 *               - markdown_key
 *               - test_keys
 *               - difficulty
 *     responses:
 *       201:
 *         description: "Problem created successfully"
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
 *                   example: "Problem created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     problem_id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     difficulty:
 *                       type: string
 *                       enum: [easy, medium, hard]
 *       400:
 *         description: "Invalid request body (validation error)"
 *       401:
 *         description: "Unauthorized (missing or invalid access token)"
 *       403:
 *         description: "Forbidden (insufficient permissions)"
 */
ProblemRouter.post(
  "/",
  parseUserHeaders,
  requireRoles([UserRole.Moderator, UserRole.Admin, UserRole.SuperAdmin]),
  getBodyValidationMiddleware(CreateProblemRequestDto),
  ProblemControllerInstance.createProblem,
);

/**
 * @swagger
 * /api/v1/problems/{problemId}:
 *   get:
 *     summary: "Get a problem by ID"
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           description: "Problem ID"
 *     produces:
 *       - "application/json"
 *     responses:
 *       200:
 *         description: "Problem fetched successfully"
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
 *                   example: "Problem fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     problem_id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     markdown_key:
 *                       type: string
 *                     test_keys:
 *                       type: array
 *                       items:
 *                         type: string
 *                     difficulty:
 *                       type: string
 *                       enum: [easy, medium, hard]
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     creator_username:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: "Problem not found"
 */
ProblemRouter.get("/:problemId", ProblemControllerInstance.getProblemById);

/**
 * @swagger
 * /api/v1/problems:
 *   get:
 *     summary: "Get problems with optional filtering and pagination"
 *     tags: [Problems]
 *     parameters:
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
 *           description: "Number of problems per page"
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: "Filter by difficulty"
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           description: "Comma-separated list of tags to filter by"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: "Search in problem titles"
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: integer
 *           description: "Filter by creator user ID"
 *     produces:
 *       - "application/json"
 *     responses:
 *       200:
 *         description: "Problems fetched successfully"
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
 *                   example: "Problems fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     problems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           problem_id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           difficulty:
 *                             type: string
 *                             enum: [easy, medium, hard]
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                           creator_username:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     totalProblems:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 */
ProblemRouter.get(
  "/",
  getQueryValidationMiddleware(GetProblemsQueryDto),
  ProblemControllerInstance.getProblems,
);

/**
 * @swagger
 * /api/v1/problems/{problemId}:
 *   patch:
 *     summary: "Update a problem"
 *     tags: [Problems]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           description: "Problem ID"
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
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: "Problem title"
 *               markdown_key:
 *                 type: string
 *                 description: "S3 key for problem statement markdown"
 *               test_keys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Array of S3 keys for test cases"
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: "Problem difficulty level"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *                 description: "Problem tags"
 *     responses:
 *       200:
 *         description: "Problem updated successfully"
 *       400:
 *         description: "Invalid request body (validation error)"
 *       401:
 *         description: "Unauthorized (missing or invalid access token)"
 *       403:
 *         description: "Forbidden (insufficient permissions)"
 *       404:
 *         description: "Problem not found"
 */
ProblemRouter.patch(
  "/:problemId",
  parseUserHeaders,
  requireRoles([UserRole.Moderator, UserRole.Admin, UserRole.SuperAdmin]),
  getBodyValidationMiddleware(UpdateProblemRequestDto),
  ProblemControllerInstance.updateProblem,
);

/**
 * @swagger
 * /api/v1/problems/{problemId}:
 *   delete:
 *     summary: "Delete a problem"
 *     tags: [Problems]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           description: "Problem ID"
 *     produces:
 *       - "application/json"
 *     responses:
 *       200:
 *         description: "Problem deleted successfully"
 *       401:
 *         description: "Unauthorized (missing or invalid access token)"
 *       403:
 *         description: "Forbidden (insufficient permissions)"
 *       404:
 *         description: "Problem not found"
 */
ProblemRouter.delete(
  "/:problemId",
  parseUserHeaders,
  requireRoles([UserRole.Moderator, UserRole.Admin, UserRole.SuperAdmin]),
  ProblemControllerInstance.deleteProblem,
);
