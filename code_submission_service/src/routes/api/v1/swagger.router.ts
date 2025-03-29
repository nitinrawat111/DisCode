import * as swaggerUi from 'swagger-ui-express';
import * as express from 'express';
import { getSwaggerDoc } from '../../../utils/swagger';

const router = express.Router();

/**
 * @openapi
 * /api-docs:
 *   get:
 *     description: Access Swagger Docs UI
 */
router.use('/', swaggerUi.serve, swaggerUi.setup(getSwaggerDoc(1)));

export default router;