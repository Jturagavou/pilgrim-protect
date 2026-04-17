/** Created with Cursor — AI-assisted. */

// One-shot migration: maps the legacy School.status enum
// ('pending' | 'active' | 'completed') onto the v2 `sponsorshipStatus` enum.
// Safe to re-run — only touches documents where sponsorshipStatus is unset.
//
// Legacy `pending` mixed "not yet sprayed" and pre-sponsorship states; we map
// it to `needs-funding` so homepage/map "helped" counts stay conservative.

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import School, { type SponsorshipStatus } from "../models/School";
import { logger } from "../lib/logger";

const STATUS_MAP: Record<string, SponsorshipStatus> = {
  completed: "data-gathered",
  active: "checked-in",
  pending: "needs-funding",
};

async function run(): Promise<void> {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/pilgrim-protect";
  await mongoose.connect(uri);

  const schools = await School.find({
    sponsorshipStatus: { $exists: false },
  });
  logger.info({ count: schools.length }, "migrating schools");

  let migrated = 0;
  for (const s of schools) {
    const next: SponsorshipStatus =
      STATUS_MAP[s.status as string] ?? "needs-funding";
    s.sponsorshipStatus = next;
    await s.save();
    migrated += 1;
  }

  logger.info({ migrated }, "migration complete");
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  logger.error({ err }, "migration failed");
  try {
    await mongoose.connection.close();
  } catch {
    /* noop */
  }
  process.exit(1);
});
