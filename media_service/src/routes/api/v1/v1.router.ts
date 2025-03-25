import * as express from 'express';
import swaggerRouter from './swagger.router';
import mediaRouter from './media.router';
import { parseUserHeaders } from '../../../middlewares/parseUserHeaders.middleware';

const router = express.Router();
router.use('/media', parseUserHeaders, mediaRouter);
router.use('/api-docs', swaggerRouter);

export default router;