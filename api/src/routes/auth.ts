import { Router, type RequestHandler } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import Worker from "../models/Worker";
import Donor from "../models/Donor";
import { protect } from "../middleware/auth";

const router = Router();

type RoleKind = "worker" | "supervisor" | "admin" | "donor";

// Generate JWT token
function generateToken(id: string, role: RoleKind): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const expiresIn = (process.env.JWT_EXPIRE || "30d") as SignOptions["expiresIn"];
  return jwt.sign({ id, role }, secret, { expiresIn });
}

// POST /api/auth/register
const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !password || !role) {
      res.status(400).json({
        error: "Please provide name, email, password, and role",
      });
      return;
    }

    if (!["worker", "donor"].includes(role)) {
      res.status(400).json({ error: 'Role must be "worker" or "donor"' });
      return;
    }

    if (role === "worker") {
      const existing = await Worker.findOne({ email });
      if (existing) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }
      const user = await Worker.create({
        name,
        email,
        password,
        role: "worker",
      });
      const token = generateToken(user._id.toString(), "worker");
      res.status(201).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: "worker",
        },
      });
      return;
    }

    const existing = await Donor.findOne({ email });
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const user = await Donor.create({ name, email, password });
    const token = generateToken(user._id.toString(), "donor");
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "donor",
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Please provide email and password" });
      return;
    }

    const worker = await Worker.findOne({ email }).select("+password");
    if (worker) {
      const isMatch = await worker.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
      const token = generateToken(worker._id.toString(), worker.role);
      res.json({
        token,
        user: {
          _id: worker._id,
          name: worker.name,
          email: worker.email,
          role: worker.role,
        },
      });
      return;
    }

    const donor = await Donor.findOne({ email }).select("+password");
    if (!donor) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const isMatch = await donor.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = generateToken(donor._id.toString(), "donor");
    res.json({
      token,
      user: {
        _id: donor._id,
        name: donor.name,
        email: donor.email,
        role: "donor",
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const me: RequestHandler = (req, res) => {
  res.json({ user: req.user });
};

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

export default router;
