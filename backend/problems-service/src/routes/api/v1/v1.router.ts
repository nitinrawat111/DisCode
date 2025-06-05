import * as express from 'express';
import swaggerRouter from './swagger.router';
import problemsRouter from './problem.router';

const router = express.Router();
router.use('/problems', problemsRouter);  
router.use('/api-docs', swaggerRouter);

export default router;