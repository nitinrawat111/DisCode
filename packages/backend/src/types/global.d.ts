declare namespace NodeJS {
  interface ProcessEnv {
    // TODO: validate using zod
    PORT: string;
    CORS_ORIGIN: string;
    NODE_ENV: "development" | "production" | "test";
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
    POSTGRES_DB_NAME: string;
    POSTGRES_USERNAME: string;
    POSTGRES_PASSWORD: string;
    AZURE_ACCOUNT_NAME: string;
    AZURE_ACCOUNT_KEY: string;
    AZURE_SERVICE_BUS_CONNECTION_STRING: string;
    AZURE_SERVICE_BUS_QUEUE_NAME: string;
  }
}
