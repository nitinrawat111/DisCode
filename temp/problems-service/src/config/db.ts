import logger from "../utils/logger";
import mongoose from "mongoose";

// Function to initialize DB
export async function dbInit() {
  try {
    // Run some initial queries
    logger.info("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Successfully connected to DB");
  } catch (err: any) {
    logger.error("Failed to connect to DB");
    logger.error(err.stack);
    process.exit(1);
  }
}
