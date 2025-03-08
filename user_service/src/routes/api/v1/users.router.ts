import express from "express";
import userController from "../../../controllers/users.controller.js";
import asyncHandler from "express-async-handler";
import { verifyJWT } from "../../../middlewares/jwt.middleware.js";

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
router.post('/register', asyncHandler(userController.register));
router.post('/login', asyncHandler(userController.login));
router.get('/profile', verifyJWT, asyncHandler(userController.getLoggedUserProfile));
router.get('/profile/:userId', asyncHandler(userController.getUserProfile));
router.patch('/profile', verifyJWT, asyncHandler(userController.updateProfile));

export default router;