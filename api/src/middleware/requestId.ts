import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      log?: typeof logger;
    }
  }
}

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id");
  const id = incoming && incoming.length > 0 ? incoming : randomUUID();
  req.id = id;
  req.log = logger.child({ requestId: id });
  res.setHeader("X-Request-Id", id);
  next();
};

export default requestId;
