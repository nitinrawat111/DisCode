import { serve, setup } from "swagger-ui-express";
import { Router } from "express";
import { generateOpenApiDocument } from "../docs/openapi";

export const SwaggerRouter: Router = Router();

const SwaggerSpecification = generateOpenApiDocument();
SwaggerRouter.use("/", serve, setup(SwaggerSpecification));
