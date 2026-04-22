import mongoose from "mongoose";
import { logger } from "../lib/logger";

mongoose.set("bufferCommands", false);

export async function connectDB(): Promise<void> {
  const requireMongo = process.env.REQUIRE_MONGODB === "true";

  try {
    // Accept MONGODB_URI (DO convention) or MONGO_URI (legacy) so existing
    // .env files keep working.
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      const message = "MONGODB_URI is not defined";
      if (requireMongo) throw new Error(message);
      logger.warn({ message }, "MongoDB disabled; continuing without database");
      return;
    }
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    logger.info({ host: conn.connection.host }, "MongoDB connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ err: error, message }, "MongoDB connection error");
    if (requireMongo) {
      process.exit(1);
    }
    logger.warn("MongoDB unavailable; API will stay online for health checks and non-DB routes");
  }
}

export default connectDB;
