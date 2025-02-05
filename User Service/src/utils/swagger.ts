import swaggerJSDoc from "swagger-jsdoc";

/**
 * This function creates a swagger specification for parsing api docs from js comments
 * The function will set the swagger config to look for api documentation in the respective routes folder depending on api version (v1 for version 1, and so on).
 * This can be used to provide different swagger docs for different api versions
 * @param version Refers to the api version
 * @returns a swagger specification which can be used by swagger-ui-express to provide api docs
 */
export function getSwaggerDoc (version: number = 1) {
    const jsDocOptions = {
        // Whether or not to throw when parsing errors
        failOnErrors: true,

        // Swagger Definition
        definition: {
            openapi: '3.0.0',
            servers: [
                {
                    url: `/api/v${version}`, // Base URL for this version of the API
                    description: `Version ${version} API`,
                },
            ],
            info: {
                title: process.env.SERVICE_NAME as string,
                version: `${version}`,
            },
        },

        // Path to the API docs
        // Note that this path is relative to the directory from which the Node.js application is executed
        apis: [`./src/routes/api/v${version}/**/*.ts`],
    }

    return swaggerJSDoc(jsDocOptions);
};