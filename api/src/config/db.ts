import mongoose from "mongoose";
import { logger } from "../lib/logger";

export async function connectDB(): Promise<void> {
  try {
    // Accept MONGODB_URI (DO convention) or MONGO_URI (legacy) so existing
    // .env files keep working.
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined");
    }
    const conn = await mongoose.connect(uri);
    logger.info({ host: conn.connection.host }, "MongoDB connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ err: error, message }, "MongoDB connection error");
    process.exit(1);
  }
}

export default connectDB;
