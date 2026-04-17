import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load env from api root
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import School, {
  type SponsorshipStatus,
  HELPED_STATUSES,
} from "../models/School";
import Worker from "../models/Worker";
import Donor from "../models/Donor";
import SprayReport from "../models/SprayReport";
import Donation from "../models/Donation";
import { logger } from "../lib/logger";

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/pilgrim-protect";

interface DistrictSeed {
  name: string;
  lat: number;
  lng: number;
  subCounties: string[];
  namePrefixes: string[];
}

// Approximate district centroids across Teso + Karamoja subregions. Jitter
// applied per school to spread the pins.
const DISTRICTS: DistrictSeed[] = [
  {
    name: "Soroti",
    lat: 1.7036,
    lng: 33.611,
    subCounties: ["Soroti Central", "Tubur", "Arapai", "Gweri"],
    namePrefixes: ["Soroti", "Arapai", "Tubur", "Gweri"],
  },
  {
    name: "Amuria",
    lat: 1.997,
    lng: 33.6438,
    subCounties: ["Amuria Town", "Morungatuny", "Wera"],
    namePrefixes: ["Amuria", "Morungatuny", "Wera"],
  },
  {
    name: "Katakwi",
    lat: 1.8958,
    lng: 33.9662,
    subCounties: ["Katakwi Central", "Usuk", "Magoro", "Ngariam"],
    namePrefixes: ["Katakwi", "Usuk", "Magoro", "Ngariam"],
  },
  {
    name: "Kumi",
    lat: 1.4603,
    lng: 33.9326,
    subCounties: ["Kumi Town", "Mukongoro", "Kanyum", "Ongino"],
    namePrefixes: ["Kumi", "Mukongoro", "Kanyum", "Ongino"],
  },
  {
    name: "Moroto",
    lat: 2.5347,
    lng: 34.6667,
    subCounties: ["Moroto Town", "Nadunget", "Katikekile", "Rupa"],
    namePrefixes: ["Moroto", "Nadunget", "Katikekile", "Rupa"],
  },
];

// Distribution per the prompt: 30% needs-funding, 25% funded, 20% contracted,
// 15% checked-in, 10% data-gathered. 30 schools → nice round counts.
const DISTRIBUTION: Array<{ status: SponsorshipStatus; count: number }> = [
  { status: "needs-funding", count: 9 },
  { status: "funded", count: 8 },
  { status: "contracted", count: 6 },
  { status: "checked-in", count: 4 },
  { status: "data-gathered", count: 3 },
];

const SAINT_NAMES = [
  "Mary",
  "Joseph",
  "Peter",
  "Augustine",
  "Francis",
  "Luke",
  "Anne",
  "Theresa",
];
const NAME_TEMPLATES = [
  (place: string) => `${place} Primary School`,
  (place: string) => `${place} Boys Secondary`,
  (place: string) => `${place} Girls Secondary`,
  (place: string) => `${place} Integrated`,
  (place: string) =>
    `St. ${SAINT_NAMES[Math.floor(Math.random() * SAINT_NAMES.length)]} ${place}`,
];

function jitter(base: number, range = 0.1): number {
  return base + (Math.random() * 2 - 1) * range;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildSchools() {
  const schools: Array<{
    name: string;
    district: string;
    subCounty: string;
    location: { type: "Point"; coordinates: [number, number] };
    lat: number;
    lng: number;
    totalRooms: number;
    studentCount: number;
    netsCount: number;
    hasMalariaClub: boolean;
    photos: string[];
    sponsorshipStatus: SponsorshipStatus;
    status: "pending" | "active" | "completed";
    fundingProgress: { raised: number; goal: number };
    lastSprayDate: Date | null;
    notes: string;
  }> = [];

  // Build a flat list of sponsorship statuses according to distribution, then
  // distribute across districts round-robin so each district has a mix.
  const statusPool: SponsorshipStatus[] = [];
  for (const { status, count } of DISTRIBUTION) {
    for (let i = 0; i < count; i += 1) statusPool.push(status);
  }
  // Shuffle so districts get mixed status allocations.
  for (let i = statusPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [statusPool[i], statusPool[j]] = [statusPool[j], statusPool[i]];
  }

  const total = statusPool.length;
  const seenNames = new Set<string>();

  for (let i = 0; i < total; i += 1) {
    const district = DISTRICTS[i % DISTRICTS.length];
    const prefix = pick(district.namePrefixes);
    const template = pick(NAME_TEMPLATES);
    let name = template(prefix);
    let guard = 0;
    while (seenNames.has(name) && guard < 6) {
      name = template(pick(district.namePrefixes));
      guard += 1;
    }
    seenNames.add(name);

    const sponsorshipStatus = statusPool[i];
    const helped = HELPED_STATUSES.includes(sponsorshipStatus);
    const isDataGathered = sponsorshipStatus === "data-gathered";
    const isCheckedIn = sponsorshipStatus === "checked-in";

    const lat = jitter(district.lat);
    const lng = jitter(district.lng);

    // Legacy status mapping — kept in lockstep so the /dashboard page
    // doesn't regress while it still reads `status`.
    const legacyStatus: "pending" | "active" | "completed" = isDataGathered
      ? "completed"
      : isCheckedIn
        ? "active"
        : "pending";

    const studentCount = rand(400, 1200);
    const goalCents = studentCount * 150 * 100; // ~$1.50 per student per year, cents

    schools.push({
      name,
      district: district.name,
      subCounty: pick(district.subCounties),
      location: { type: "Point", coordinates: [lng, lat] },
      lat,
      lng,
      totalRooms: rand(6, 20),
      studentCount,
      netsCount: rand(0, 300),
      hasMalariaClub: Math.random() < 0.6,
      photos: [],
      sponsorshipStatus,
      status: legacyStatus,
      fundingProgress: {
        raised: helped ? rand(goalCents / 2, goalCents) : rand(0, goalCents / 4),
        goal: goalCents,
      },
      lastSprayDate: isDataGathered
        ? new Date(Date.now() - rand(5, 45) * 24 * 60 * 60 * 1000)
        : isCheckedIn
          ? new Date(Date.now() - rand(10, 60) * 24 * 60 * 60 * 1000)
          : null,
      notes: "",
    });
  }

  return schools;
}

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
    const schoolsData = buildSchools();
    const schools = await School.insertMany(schoolsData);
    logger.info(
      {
        count: schools.length,
        byStatus: DISTRIBUTION.map((d) => `${d.status}:${d.count}`).join(" "),
      },
      "Seeded schools"
    );

    // --- Seed Workers ---
    const helpedSchools = schools.filter((s) =>
      HELPED_STATUSES.includes(s.sponsorshipStatus)
    );
    const worker1 = await Worker.create({
      name: "James Okello",
      email: "worker1@test.com",
      phone: "+256701000001",
      password: "password123",
      role: "field_worker",
      assignedSchools: helpedSchools.slice(0, 4).map((s) => s._id),
      active: true,
    });

    const worker2 = await Worker.create({
      name: "Grace Auma",
      email: "worker2@test.com",
      phone: "+256701000002",
      password: "password123",
      role: "field_worker",
      assignedSchools: helpedSchools.slice(4, 8).map((s) => s._id),
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
      sponsoredSchools: helpedSchools.slice(0, 2).map((s) => s._id),
      totalDonated: 15000,
      receiveUpdates: true,
    });
    logger.info("Seeded 1 donor");

    // --- Seed Spray Reports for checked-in + data-gathered schools ---
    const reportableSchools = schools.filter((s) =>
      ["checked-in", "data-gathered"].includes(s.sponsorshipStatus)
    );
    const reportData = reportableSchools.flatMap((school) => {
      const base: Array<Record<string, unknown>> = [
        {
          school: school._id,
          worker: worker1._id,
          date: school.lastSprayDate ?? new Date(),
          roomsSprayed: Math.floor(school.totalRooms * 0.6),
          photos: [],
          notes: "Initial spray pass — north wing.",
          gpsCoords: { lat: school.lat, lng: school.lng },
          verified: school.sponsorshipStatus === "data-gathered",
        },
      ];
      if (school.sponsorshipStatus === "data-gathered") {
        base.push({
          school: school._id,
          worker: worker2._id,
          date: school.lastSprayDate ?? new Date(),
          roomsSprayed: Math.ceil(school.totalRooms * 0.4),
          photos: [],
          notes: "Second pass — remaining classrooms complete.",
          gpsCoords: { lat: school.lat, lng: school.lng },
          verified: true,
        });
      }
      return base;
    });
    const reports = await SprayReport.insertMany(reportData);
    logger.info({ count: reports.length }, "Seeded spray reports");

    // --- Seed Donation (one, against the first helped school) ---
    if (helpedSchools[0]) {
      await Donation.create({
        donor: donor._id,
        school: helpedSchools[0]._id,
        amount: 15000,
        currency: "usd",
        stripePaymentId: "mock_pi_seed_001",
        recurring: false,
        status: "completed",
      });
    }
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
