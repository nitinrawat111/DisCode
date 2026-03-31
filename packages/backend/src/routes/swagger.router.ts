import { serve, setup } from "swagger-ui-express";
import { Router } from "express";
import { resolve } from "path";
import swaggerJSDoc from "swagger-jsdoc"; // This provides default imports only
import { SERVICE_NAME } from "../constants";

export const SwaggerRouter: Router = Router();

const swaggerSpecification = swaggerJSDoc({
  // Whether or not to throw when parsing errors
  failOnErrors: true,

  // Swagger Definition
  definition: {
    openapi: "3.0.0",
    servers: [
      {
        url: `/`, // Base URL for this version of the API
        description: SERVICE_NAME,
      },
    ],
    info: {
      title: SERVICE_NAME,
      version: "1.0.0", // TODO: Manage this
    },
  },

  // Path to the API docs
  // Use absolute path to prevent ambiguity
  // Use .js to pick up compiled files
  apis: [resolve(__dirname, "./api/**/*.js")],
});

/**
 * @openapi
 * /api-docs:
 *   get:
 *     description: Access Swagger Docs UI
 */
SwaggerRouter.use("/", serve, setup(swaggerSpecification));
