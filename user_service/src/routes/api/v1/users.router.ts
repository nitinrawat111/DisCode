import * as express from 'express';
import { userControllerInstance } from '../../../controllers/users.controller';
import * as asyncHandler from 'express-async-handler';
import { parseUserHeaders } from '../../../middlewares/parseUserHeaders.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: "Register a new user"
 *     tags: [Users]
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
 *                   example: "Succesfully registered"
 *       400:
 *         description: "Invalid request body (validation error)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid Request"
 *                 errors:
 *                   type: object
 *                   description: "Zod validation errors"
 *       409:
 *         description: "Username or email already exists"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
 */
router.post('/register', asyncHandler(userControllerInstance.register));

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: "Log in a user and return an access token"
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "User's email address"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: "User's password"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: "Login successful, sets accessToken cookie"
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
 *                   example: "Logged in successfully"
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "accessToken=eyJhbG...; Max-Age=3600; HttpOnly; Secure"
 *               description: "JWT access token set in a cookie"
 *       400:
 *         description: "Invalid request body (validation error)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid Request"
 *                 errors:
 *                   type: object
 *       401:
 *         description: "Incorrect password"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Incorrect Password"
 *       404:
 *         description: "Email not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Email not found"
 */
router.post('/login', asyncHandler(userControllerInstance.login));

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: "Get the profile of the logged-in user"
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     produces:
 *       - "application/json"
 *     responses:
 *       200:
 *         description: "User profile fetched successfully"
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
 *                   example: "User Profile fecthed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     avatarUrl:
 *                       type: string
 *                       nullable: true
 *                     role:
 *                       type: string
 *                       enum: [superadmin, admin, moderator, normal]
 *       401:
 *         description: "Unauthorized (missing or invalid access token)"
 *       404:
 *         description: "User not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.get('/profile', parseUserHeaders, asyncHandler(userControllerInstance.getLoggedUserProfile));

/**
 * @swagger
 * /api/v1/users/profile/{userId}:
 *   get:
 *     summary: "Get a user's profile by ID"
 *     tags: [Users]
 *     produces:
 *       - "application/json"
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           description: "The ID of the user to fetch"
 *     responses:
 *       200:
 *         description: "User profile fetched successfully"
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
 *                   example: "User Profile fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     avatarUrl:
 *                       type: string
 *                       nullable: true
 *                     role:
 *                       type: string
 *                       enum: [superadmin, admin, moderator, normal]
 *       400:
 *         description: "Invalid userId"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid Request"
 *       404:
 *         description: "User not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.get('/profile/:userId', asyncHandler(userControllerInstance.getUserProfile));

/**
 * @swagger
 * /api/v1/users/profile:
 *   patch:
 *     summary: "Update the logged-in user's profile"
 *     tags: [Users]
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
 *               username:
 *                 type: string
 *                 maxLength: 30
 *                 description: "New username (optional)"
 *                 nullable: true
 *               bio:
 *                 type: string
 *                 description: "New bio (optional)"
 *                 nullable: true
 *               avatarUrl:
 *                 type: string
 *                 description: "New avatar URL (optional)"
 *                 nullable: true
 *     responses:
 *       200:
 *         description: "Profile updated successfully"
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
 *                   example: "User Profile updated successfully"
 *       400:
 *         description: "Invalid request body (validation error)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid Request"
 *                 errors:
 *                   type: object
 *       401:
 *         description: "Unauthorized (missing or invalid access token)"
 *       409:
 *         description: "Username already exists"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "Username already exists"
 */
router.patch('/profile', parseUserHeaders, asyncHandler(userControllerInstance.updateProfile));

/**
 * @swagger
 * /api/v1/users/role/{userId}:
 *   get:
 *     summary: "Get a user's role by ID"
 *     tags: [Users]
 *     produces:
 *       - "application/json"
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           description: "The ID of the user whose role is to be fetched"
 *     responses:
 *       200:
 *         description: "User role fetched successfully"
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
 *                   example: "User role fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [superadmin, admin, moderator, normal]
 *       400:
 *         description: "Invalid userId"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid Request"
 *       404:
 *         description: "User not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "UserId not found"
 */
router.get('/role/:userId', asyncHandler(userControllerInstance.getUserRole));

/**
 * @swagger
 * /api/v1/users/role/{userId}:
 *   put:
 *     summary: "Change a user's role (requires sufficient privileges)"
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     consumes:
 *       - "application/json"
 *     produces:
 *       - "application/json"
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           description: "The ID of the user whose role is to be changed"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newRole:
 *                 type: string
 *                 enum: [superadmin, admin, moderator, normal]
 *                 description: "The new role to assign"
 *             required:
 *               - newRole
 *     responses:
 *       200:
 *         description: "Role changed successfully"
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
 *                   example: "Successfully changed user role"
 *       400:
 *         description: "Invalid request body or userId"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid Request"
 *       401:
 *         description: "Unauthorized (missing or invalid access token)"
 *       403:
 *         description: "Forbidden (insufficient privileges)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to modify this user's role"
 *       404:
 *         description: "Target user not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "UserId not found"
 */
router.put('/role/:userId', parseUserHeaders, asyncHandler(userControllerInstance.changeRole));

export default router;