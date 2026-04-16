import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load env from api root
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import School from "../models/School";
import Worker from "../models/Worker";
import Donor from "../models/Donor";
import SprayReport from "../models/SprayReport";
import Donation from "../models/Donation";
import { logger } from "../lib/logger";

import schoolsData from "./schools.json";

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/pilgrim-protect";

async function seed(): Promise<void> {
  try {
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    logger.info("Connected. Clearing existing data...");

    await Promise.all([
      School.deleteMany({}),
      Worker.deleteMany({}),
      Donor.deleteMany({}),
      SprayReport.deleteMany({}),
      Donation.deleteMany({}),
    ]);
    logger.info("Collections cleared.");

    // --- Seed Schools ---
    const schools = await School.insertMany(schoolsData);
    logger.info({ count: schools.length }, "Seeded schools");

    // --- Seed Workers ---
    const worker1 = await Worker.create({
      name: "James Okello",
      email: "worker1@test.com",
      phone: "+256701000001",
      password: "password123",
      role: "field_worker",
      assignedSchools: [schools[0]._id, schools[1]._id, schools[2]._id],
      active: true,
    });

    const worker2 = await Worker.create({
      name: "Grace Auma",
      email: "worker2@test.com",
      phone: "+256701000002",
      password: "password123",
      role: "field_worker",
      assignedSchools: [schools[3]._id, schools[4]._id, schools[5]._id],
      active: true,
    });

    await Worker.create({
      name: "Admin User",
      email: "admin@test.com",
      phone: "+256701000000",
      password: "password123",
      role: "admin",
      assignedSchools: [],
      active: true,
    });

    logger.info("Seeded 2 field workers + 1 admin");

    // --- Seed Donor ---
    const donor = await Donor.create({
      name: "Sarah Johnson",
      email: "donor@test.com",
      password: "password123",
      stripeCustomerId: "cus_mock_001",
      sponsoredSchools: [schools[0]._id],
      totalDonated: 15000, // $150.00 in cents
      receiveUpdates: true,
    });
    logger.info("Seeded 1 donor");

    await School.findByIdAndUpdate(schools[0]._id, { sponsor: donor._id });

    // --- Seed Spray Reports ---
    const reportData = [
      {
        school: schools[0]._id,
        worker: worker1._id,
        date: new Date("2026-02-10"),
        roomsSprayed: 8,
        photos: [
          "https://res.cloudinary.com/demo/image/upload/v1/pilgrim-protect/report1.jpg",
        ],
        notes: "Completed north wing. Good coverage on all surfaces.",
        gpsCoords: { lat: 2.7746, lng: 32.299 },
        verified: true,
      },
      {
        school: schools[0]._id,
        worker: worker1._id,
        date: new Date("2026-03-05"),
        roomsSprayed: 6,
        photos: [
          "https://res.cloudinary.com/demo/image/upload/v1/pilgrim-protect/report2.jpg",
        ],
        notes:
          "South wing complete. Minor repairs needed on 2 window screens.",
        gpsCoords: { lat: 2.7748, lng: 32.2992 },
        verified: true,
      },
      {
        school: schools[1]._id,
        worker: worker1._id,
        date: new Date("2026-02-20"),
        roomsSprayed: 12,
        photos: [],
        notes: "Full school spray completed in single session.",
        gpsCoords: { lat: 2.2499, lng: 32.5339 },
        verified: false,
      },
      {
        school: schools[3]._id,
        worker: worker2._id,
        date: new Date("2026-03-01"),
        roomsSprayed: 10,
        photos: [
          "https://res.cloudinary.com/demo/image/upload/v1/pilgrim-protect/report4.jpg",
        ],
        notes: "Classrooms and staff quarters sprayed.",
        gpsCoords: { lat: 0.4244, lng: 33.2026 },
        verified: true,
      },
      {
        school: schools[4]._id,
        worker: worker2._id,
        date: new Date("2026-03-15"),
        roomsSprayed: 7,
        photos: [],
        notes: "First phase — remaining rooms scheduled for next visit.",
        gpsCoords: { lat: 1.0649, lng: 34.1755 },
        verified: false,
      },
    ];

    const reports = await SprayReport.insertMany(reportData);
    logger.info({ count: reports.length }, "Seeded spray reports");

    // Update lastSprayDate on schools that were sprayed
    await School.findByIdAndUpdate(schools[0]._id, {
      lastSprayDate: new Date("2026-03-05"),
      status: "active",
    });
    await School.findByIdAndUpdate(schools[1]._id, {
      lastSprayDate: new Date("2026-02-20"),
      status: "active",
    });
    await School.findByIdAndUpdate(schools[3]._id, {
      lastSprayDate: new Date("2026-03-01"),
      status: "active",
    });
    await School.findByIdAndUpdate(schools[4]._id, {
      lastSprayDate: new Date("2026-03-15"),
      status: "active",
    });

    // --- Seed Donation ---
    await Donation.create({
      donor: donor._id,
      school: schools[0]._id,
      amount: 15000,
      currency: "usd",
      stripePaymentId: "mock_pi_seed_001",
      recurring: false,
      status: "completed",
    });
    logger.info("Seeded 1 donation");

    logger.info(
      {
        accounts: {
          field_worker_1: "worker1@test.com / password123",
          field_worker_2: "worker2@test.com / password123",
          admin: "admin@test.com / password123",
          donor: "donor@test.com / password123",
        },
      },
      "Seed complete"
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Seed error");
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
