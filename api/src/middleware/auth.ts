import jwt, { type JwtPayload } from "jsonwebtoken";
import type { RequestHandler } from "express";
import Worker from "../models/Worker";
import Donor from "../models/Donor";

interface AuthPayload extends JwtPayload {
  id: string;
  role: string;
}

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

    // Try to find user in Worker or Donor collection based on role
    let user = null;
    if (
      decoded.role === "worker" ||
      decoded.role === "supervisor" ||
      decoded.role === "admin"
    ) {
      user = await Worker.findById(decoded.id);
    } else if (decoded.role === "donor") {
      user = await Donor.findById(decoded.id);
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
