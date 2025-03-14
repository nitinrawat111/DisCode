import * as express from "express";
import { userControllerInstance } from "../../../controllers/users.controller";
import * as asyncHandler from "express-async-handler";
import { parseUserHeaders } from "../../../middlewares/parseUserHeaders.middleware";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: "Register a new user"
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
 *               username:
 *                 type: string
 *                 maxLength: 30
 *                 description: "User's username (max 30 characters)"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "User's email address"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: "User's password (min 8 characters)"
 *               bio:
 *                 type: string
 *                 description: "User bio"
 *                 nullable: true
 *               avatarUrl:
 *                 type: string
 *                 description: "URL of the user's avatar"
 *                 nullable: true
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: "Registration successful"
 *       409:
 *         description: "Username/Email already exists"
 */
router.post('/register', asyncHandler(userControllerInstance.register));
router.post('/login', asyncHandler(userControllerInstance.login));
router.get('/profile', parseUserHeaders, asyncHandler(userControllerInstance.getLoggedUserProfile));
router.get('/profile/:userId', asyncHandler(userControllerInstance.getUserProfile));
router.patch('/profile', parseUserHeaders, asyncHandler(userControllerInstance.updateProfile));

export default router;