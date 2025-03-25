import * as express from 'express';
import swaggerRouter from './swagger.router';

const router = express.Router();
router.use('/api-docs', swaggerRouter);

export default router;