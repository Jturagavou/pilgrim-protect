import pino, { type Logger } from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: { service: "pilgrim-protect-api" },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss.l" },
        },
      }),
});

export default logger;
