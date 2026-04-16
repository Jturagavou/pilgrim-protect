import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger";

interface ErrorWithStatus extends Error {
  statusCode?: number;
  code?: number;
  errors?: Record<string, { message: string }>;
  keyValue?: Record<string, unknown>;
  value?: unknown;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const error = err as ErrorWithStatus;
  (req.log ?? logger).error(
    { err: error, stack: error.stack },
    error.message || "Unhandled error"
  );

  // Mongoose validation error
  if (error.name === "ValidationError" && error.errors) {
    const messages = Object.values(error.errors).map((e) => e.message);
    res.status(400).json({ error: messages.join(", ") });
    return;
  }

  // Mongoose duplicate key error
  if (error.code === 11000 && error.keyValue) {
    const field = Object.keys(error.keyValue)[0];
    res.status(400).json({ error: `Duplicate value for field: ${field}` });
    return;
  }

  // Mongoose bad ObjectId
  if (error.name === "CastError") {
    res.status(400).json({ error: `Invalid ID format: ${error.value}` });
    return;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  if (error.name === "TokenExpiredError") {
    res.status(401).json({ error: "Token expired" });
    return;
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    error: error.message || "Internal server error",
  });
};

export default errorHandler;
