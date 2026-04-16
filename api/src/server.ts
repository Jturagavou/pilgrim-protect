import dotenv from "dotenv";

// Load env vars before anything imports from process.env
dotenv.config();

import { initSentry, Sentry } from "./lib/sentry";
initSentry();

import express, { type RequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import connectDB from "./config/db";
import errorHandler from "./middleware/errorHandler";
import requestId from "./middleware/requestId";
import { logger } from "./lib/logger";

import v1Routes from "./routes/v1";
import healthRoutes from "./routes/health";

const app = express();

// Connect to MongoDB
connectDB();

// --- Platform middleware ---
app.use(requestId);

// Structured HTTP logging with request IDs
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => (req as express.Request).id,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS — allow the configured web origins + any origin for mobile clients.
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_URL ||
  "http://localhost:3000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // Mobile clients / Postman have no origin header
    },
    credentials: true,
  })
);

// --- Routes ---
app.use("/health", healthRoutes);
app.use(`/api/${process.env.API_VERSION || "v1"}`, v1Routes);

// 404 handler
const notFound: RequestHandler = (req, res) => {
  res
    .status(404)
    .json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};
app.use(notFound);

// Sentry error handler must come before any other error middleware
Sentry.setupExpressErrorHandler(app);

// App error handler (must be last)
app.use(errorHandler);

// --- Start Server ---
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => {
  logger.info(
    { port: PORT, env: process.env.NODE_ENV || "development" },
    `Pilgrim Protect API listening`
  );
});

export default app;
