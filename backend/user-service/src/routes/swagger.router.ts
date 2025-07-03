import { serve, setup } from "swagger-ui-express";
import { Router } from "express";
import { resolve } from "path";
import swaggerJSDoc from "swagger-jsdoc"; // This provides default imports only
import { SERVICE_NAME } from "../constants";

export const SwaggerRouter = Router();

const swaggerSpecification = swaggerJSDoc({
  // Whether or not to throw when parsing errors
  failOnErrors: true,

  // Swagger Definition
  definition: {
    openapi: "3.0.0",
    servers: [
      {
        url: `/`, // Base URL for this version of the API
        description: `${SERVICE_NAME} API`,
      },
    ],
    info: {
      title: SERVICE_NAME,
      version: "1.0.0", // TODO: Manage this
    },
  },

  // Path to the API docs
  // Use absolute path prevent ambiguity
  apis: [resolve(__dirname, "./api/**/*.ts")],
});

/**
 * @openapi
 * /api-docs:
 *   get:
 *     description: Access Swagger Docs UI
 */
SwaggerRouter.use("/", serve, setup(swaggerSpecification));
