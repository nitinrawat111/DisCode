import * as express from 'express';
import swaggerRouter from './swagger.router';
import userRouter from './user.router';

const router = express.Router();
router.use('/users', userRouter);
router.use('/api-docs', swaggerRouter);

export default router;