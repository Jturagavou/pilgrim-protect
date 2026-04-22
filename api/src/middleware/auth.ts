import jwt, { type JwtPayload } from "jsonwebtoken";
import type { RequestHandler } from "express";
import mongoose from "mongoose";
import Worker from "../models/Worker";
import Donor from "../models/Donor";

interface AuthPayload extends JwtPayload {
  id: string;
  role: string;
}

const demoUsers: Record<string, { _id: string; name: string; email: string; role: string }> = {
  "demo-worker-1": {
    _id: "demo-worker-1",
    name: "James Okello",
    email: "worker1@test.com",
    role: "field_worker",
  },
  "demo-worker-2": {
    _id: "demo-worker-2",
    name: "Grace Auma",
    email: "worker2@test.com",
    role: "field_worker",
  },
  "demo-admin": {
    _id: "demo-admin",
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
  },
  "demo-donor": {
    _id: "demo-donor",
    name: "Sarah Johnson",
    email: "donor@test.com",
    role: "donor",
  },
};

// Verify JWT token and attach user to request
export const protect: RequestHandler = async (req, res, next) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ error: "Not authorized — no token provided" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, secret) as AuthPayload;

    if (mongoose.connection.readyState !== 1 && demoUsers[decoded.id]) {
      if (req.method !== "GET") {
        res.status(503).json({
          error: "Demo auth is read-only until MongoDB is connected.",
        });
        return;
      }
      req.user = demoUsers[decoded.id] as unknown as typeof req.user;
      next();
      return;
    }

    // Donors live in the Donor collection; field_worker/admin/super_admin in Worker.
    let user = null;
    if (decoded.role === "donor") {
      user = await Donor.findById(decoded.id);
    } else if (
      decoded.role === "field_worker" ||
      decoded.role === "admin" ||
      decoded.role === "super_admin"
    ) {
      user = await Worker.findById(decoded.id);
    }

    if (!user) {
      res.status(401).json({ error: "Not authorized — user not found" });
      return;
    }

    // Attach user with decoded role onto the request
    req.user = Object.assign(user, { role: decoded.role }) as typeof req.user;
    next();
  } catch {
    res.status(401).json({ error: "Not authorized — invalid token" });
  }
};

// Role-based access guard
export const authorize =
  (...roles: string[]): RequestHandler =>
  (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      res.status(403).json({
        error: `Role "${role ?? "unknown"}" is not authorized to access this route`,
      });
      return;
    }
    next();
  };
