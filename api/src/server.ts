import express, { type RequestHandler } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db";
import errorHandler from "./middleware/errorHandler";

// Load env vars
dotenv.config();

// Route imports
import authRoutes from "./routes/auth";
import schoolRoutes from "./routes/schools";
import sprayReportRoutes from "./routes/sprayReports";
import donationRoutes from "./routes/donations";
import statsRoutes from "./routes/stats";
import uploadRoutes from "./routes/upload";

const app = express();

// Connect to MongoDB
connectDB();

// --- Middleware ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS — allow Next.js web app + all origins for mobile
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        process.env.CLIENT_URL || "http://localhost:3000",
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow all other origins (for mobile app)
      return callback(null, true);
    },
    credentials: true,
  })
);

// Request logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/spray-reports", sprayReportRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "pilgrim-protect-api",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
const notFound: RequestHandler = (req, res) => {
  res
    .status(404)
    .json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// --- Start Server ---
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(
    `Pilgrim Protect API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`
  );
});

export default app;
