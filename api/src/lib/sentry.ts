import * as Sentry from "@sentry/node";
import { logger } from "./logger";

let initialized = false;

export function initSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.info({ sentry: "disabled" }, "Sentry not initialized (no DSN)");
    return false;
  }
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
    release: process.env.APP_VERSION,
  });
  initialized = true;
  logger.info({ sentry: "enabled" }, "Sentry initialized");
  return true;
}

export function isSentryEnabled(): boolean {
  return initialized;
}

export { Sentry };
