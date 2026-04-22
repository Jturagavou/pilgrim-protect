import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Worker from "../models/Worker";
import { logger } from "../lib/logger";
import { importPilgrimData } from "./import-pilgrim-data";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/pilgrim-protect";

interface SetupOptions {
  dryRun: boolean;
  resetData: boolean;
  skipData: boolean;
}

function parseArgs(argv: string[]): SetupOptions {
  return {
    dryRun: argv.includes("--dry-run"),
    resetData: argv.includes("--reset-data"),
    skipData: argv.includes("--skip-data"),
  };
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for production DB setup`);
  return value;
}

function assertStrongPassword(password: string): void {
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters for production setup");
  }
}

async function upsertAdmin(options: SetupOptions): Promise<"created" | "updated" | "would-create" | "would-update"> {
  const email = requireEnv("ADMIN_EMAIL").toLowerCase();
  const password = requireEnv("ADMIN_PASSWORD");
  assertStrongPassword(password);

  const existing = await Worker.findOne({ email });

  if (options.dryRun) {
    return existing ? "would-update" : "would-create";
  }

  if (existing) {
    existing.name = process.env.ADMIN_NAME?.trim() || existing.name || "Pilgrim Protect Admin";
    existing.password = password;
    existing.role = "admin";
    existing.active = true;
    await existing.save();
    return "updated";
  }

  await Worker.create({
    name: process.env.ADMIN_NAME?.trim() || "Pilgrim Protect Admin",
    email,
    phone: process.env.ADMIN_PHONE?.trim() || "",
    password,
    role: "admin",
    assignedSchools: [],
    active: true,
  });
  return "created";
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  await mongoose.connect(MONGO_URI);

  const adminStatus = await upsertAdmin(options);
  logger.info({ dryRun: options.dryRun, adminStatus }, "Production admin setup complete");

  if (!options.skipData) {
    const importResult = await importPilgrimData({
      dryRun: options.dryRun,
      reset: options.resetData,
      schoolsOnly: false,
      reportsOnly: false,
    });
    logger.info({ dryRun: options.dryRun, ...importResult }, "Production data setup complete");
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  logger.error({ err: error }, "Production DB setup failed");
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
