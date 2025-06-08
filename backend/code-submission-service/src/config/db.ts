import * as pg from "pg";
import {
  submissionStatusDefinitionQuery,
  submissionTableCreationQuery,
} from "../models/submission.model";
import logger from "../utils/logger";

export const dbPool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB_NAME,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
});

// Function to initialize DB
export async function dbInit() {
  try {
    // Run some initial queries
    logger.info("Initializing DB");
    await dbPool.query(submissionStatusDefinitionQuery);
    await dbPool.query(submissionTableCreationQuery);
    logger.info("Successfully initialized DB");
  } catch (err: any) {
    logger.error("Failed to initialize DB");
    logger.error(err.stack);
    process.exit(1);
  }
}
