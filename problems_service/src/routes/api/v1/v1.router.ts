import * as express from 'express';
import swaggerRouter from './swagger.router';
import mediaRouter from './media.router';

const router = express.Router();
router.use('/media', mediaRouter);
router.use('/api-docs', swaggerRouter);

export default router;