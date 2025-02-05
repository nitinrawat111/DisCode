import express from 'express';
import swaggerRouter from './swagger.router.js';
import userRouter from './users.router.js';

const router = express.Router();
router.use('/users', userRouter);
router.use('/api-docs', swaggerRouter);

export default router;