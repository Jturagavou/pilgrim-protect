import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";

import School from "../models/School";
import SprayReport from "../models/SprayReport";
import Worker from "../models/Worker";
import { logger } from "../lib/logger";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const DATA_DIR = path.join(__dirname, "..", "seed", "pilgrim-data");
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/pilgrim-protect";

interface SeedSchool {
  key: string;
  name: string;
  district: string;
  subCounty?: string | null;
  lat: number;
  lng: number;
  locationQuality: "reported" | "estimated-district" | "missing";
  studentCount: number;
  boarderCount: number;
  totalRooms: number;
  lastSprayDate?: string | null;
  sponsorshipStatus:
    | "needs-funding"
    | "funded"
    | "contracted"
    | "checked-in"
    | "data-gathered";
  status: "pending" | "active" | "completed";
  fundingGoalCents: number;
  notes?: string | null;
  sources: string[];
}

interface SeedSprayEvent {
  schoolKey: string;
  school: string;
  district: string;
  sprayingDate?: string | null;
  sprayOperatorCode?: string | null;
  teamLeaderCode?: string | null;
  uuid?: string | null;
  insecticide?: string | null;
  structures: number;
  housesFound: number;
  totalRooms: number;
  roomsSprayed: number;
  roomsUnsprayed: number;
  sachetsUsed: number;
  sourceFile: string;
}

export interface ImportOptions {
  dryRun: boolean;
  reset: boolean;
  schoolsOnly: boolean;
  reportsOnly: boolean;
}

export interface ImportResult {
  schoolsCreated: number;
  schoolsUpdated: number;
  reportsCreated: number;
  reportsSkipped: number;
}

interface SchoolImportDoc {
  name: string;
  district: string;
  subCounty?: string;
  location: { type: "Point"; coordinates: [number, number] };
  lat: number;
  lng: number;
  totalRooms: number;
  studentCount: number;
  netsCount: number;
  hasMalariaClub: boolean;
  photos: string[];
  fundingProgress: { raised: number; goal: number };
  sponsorshipStatus: SeedSchool["sponsorshipStatus"];
  status: SeedSchool["status"];
  lastSprayDate: Date | null;
  notes: string;
  source: "pilgrim-data";
  sourceFile: string;
  importedAt: Date;
}

export function parseArgs(argv: string[]): ImportOptions {
  return {
    dryRun: argv.includes("--dry-run"),
    reset: argv.includes("--reset"),
    schoolsOnly: argv.includes("--schools-only"),
    reportsOnly: argv.includes("--reports-only"),
  };
}

function readJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), "utf8")) as T;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toSchoolDoc(school: SeedSchool): SchoolImportDoc {
  const notes = [
    school.notes,
    `Pilgrim data import. Source files: ${school.sources.join(", ")}. Location quality: ${school.locationQuality}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    name: school.name,
    district: school.district,
    subCounty: school.subCounty ?? undefined,
    location: { type: "Point", coordinates: [school.lng, school.lat] },
    lat: school.lat,
    lng: school.lng,
    totalRooms: school.totalRooms,
    studentCount: school.studentCount,
    netsCount: 0,
    hasMalariaClub: false,
    photos: [],
    fundingProgress: { raised: 0, goal: school.fundingGoalCents },
    sponsorshipStatus: school.sponsorshipStatus,
    status: school.status,
    lastSprayDate: parseDate(school.lastSprayDate),
    notes,
    source: "pilgrim-data",
    sourceFile: school.sources.join(", ").slice(0, 500),
    importedAt: new Date(),
  };
}

async function ensureImportWorker(dryRun: boolean) {
  const email = "pilgrim-data-import@pilgrimprotect.local";
  const existing = await Worker.findOne({ email });
  if (existing || dryRun) return existing;

  return Worker.create({
    name: "Pilgrim Data Import",
    email,
    password: "pilgrim-data-import-only",
    role: "field_worker",
    active: false,
  });
}

export async function importPilgrimData(
  options: ImportOptions
): Promise<ImportResult> {
  const schools = readJson<SeedSchool[]>("schools.json");
  const sprayEvents = readJson<SeedSprayEvent[]>("irs-spray-events.json");

  logger.info(
    {
      dataDir: DATA_DIR,
      schools: schools.length,
      sprayEvents: sprayEvents.length,
      options,
    },
    "Prepared Pilgrim data import"
  );

  if (options.reset && !options.dryRun) {
    const reportResult = await SprayReport.deleteMany({
      notes: /Pilgrim data import:/,
    });
    const schoolResult = await School.deleteMany({ source: "pilgrim-data" });
    logger.warn(
      { deletedReports: reportResult.deletedCount, deletedSchools: schoolResult.deletedCount },
      "Reset previously imported Pilgrim data"
    );
  }

  const schoolIdByKey = new Map<string, mongoose.Types.ObjectId>();
  let schoolsCreated = 0;
  let schoolsUpdated = 0;

  if (!options.reportsOnly) {
    for (const school of schools) {
      const doc = toSchoolDoc(school);
      const existing = await School.findOne({
        name: school.name,
        district: school.district,
      });

      if (options.dryRun) {
        if (existing) schoolsUpdated += 1;
        else schoolsCreated += 1;
        schoolIdByKey.set(
          school.key,
          existing?._id ?? new mongoose.Types.ObjectId()
        );
        continue;
      }

      if (existing) {
        existing.set(doc);
        await existing.save();
        schoolIdByKey.set(school.key, existing._id);
        schoolsUpdated += 1;
      } else {
        const created = await School.create(doc);
        schoolIdByKey.set(school.key, created._id);
        schoolsCreated += 1;
      }
    }
  } else {
    const existingSchools = await School.find({ source: "pilgrim-data" }).select(
      "_id name district"
    );
    for (const school of schools) {
      const match = existingSchools.find(
        (candidate) =>
          candidate.name === school.name && candidate.district === school.district
      );
      if (match) schoolIdByKey.set(school.key, match._id);
    }
  }

  let reportsCreated = 0;
  let reportsSkipped = 0;

  if (!options.schoolsOnly) {
    const worker = await ensureImportWorker(options.dryRun);
    if (!worker && !options.dryRun) {
      throw new Error("Unable to create or find Pilgrim data import worker");
    }

    for (const event of sprayEvents) {
      const schoolId = schoolIdByKey.get(event.schoolKey);
      if (!schoolId || !event.sprayingDate) {
        reportsSkipped += 1;
        continue;
      }

      const marker = event.uuid
        ? `uuid=${event.uuid}`
        : `operator=${event.sprayOperatorCode ?? "unknown"};date=${event.sprayingDate}`;
      const exists = await SprayReport.findOne({
        school: schoolId,
        notes: new RegExp(escapeRegex(marker)),
      }).lean();

      if (exists) {
        reportsSkipped += 1;
        continue;
      }

      if (options.dryRun) {
        reportsCreated += 1;
        continue;
      }

      await SprayReport.create({
        school: schoolId,
        worker: worker!._id,
        date: parseDate(event.sprayingDate) ?? new Date(),
        roomsSprayed: event.roomsSprayed,
        photos: [],
        gpsCoords: {},
        verified: true,
        notes: [
          `Pilgrim data import: ${marker}`,
          `operator=${event.sprayOperatorCode ?? "unknown"}`,
          `teamLeader=${event.teamLeaderCode ?? "unknown"}`,
          `insecticide=${event.insecticide ?? "unknown"}`,
          `structures=${event.structures}`,
          `roomsUnsprayed=${event.roomsUnsprayed}`,
          `source=${event.sourceFile}`,
        ].join("; "),
      });
      reportsCreated += 1;
    }
  }

  logger.info(
    {
      dryRun: options.dryRun,
      schoolsCreated,
      schoolsUpdated,
      reportsCreated,
      reportsSkipped,
    },
    "Pilgrim data import complete"
  );

  return {
    schoolsCreated,
    schoolsUpdated,
    reportsCreated,
    reportsSkipped,
  };
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  await mongoose.connect(MONGO_URI);
  await importPilgrimData(options);
  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch(async (error) => {
    logger.error({ err: error }, "Pilgrim data import failed");
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
}
