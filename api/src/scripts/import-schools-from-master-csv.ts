import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import School from "../models/School";
import { logger } from "../lib/logger";

const DEFAULT_CSV_PATH =
  "/Users/jonaturagavou/Desktop/Uganda_Schools_Master_Database.csv";
const DEFAULT_LIMIT = 100;
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/pilgrim-protect";

interface CsvRow {
  "Institution Name": string;
  Type: string;
  "City/Region": string;
  Latitude: string;
  Longitude: string;
}

interface ImportSchoolRow {
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
  sponsorshipStatus: "needs-funding";
  status: "pending";
  fundingProgress: { raised: number; goal: number };
  notes: string;
  source: "master-csv";
  sourceFile: string;
  importedAt: Date;
}

function parseArgs(argv: string[]): { file: string; limit: number } {
  let file = DEFAULT_CSV_PATH;
  let limit = DEFAULT_LIMIT;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--file" && argv[i + 1]) {
      file = argv[i + 1];
      i += 1;
    } else if (arg === "--limit" && argv[i + 1]) {
      const value = Number(argv[i + 1]);
      if (Number.isFinite(value) && value > 0) limit = value;
      i += 1;
    }
  }

  return { file, limit };
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const row = Object.fromEntries(
      header.map((key, index) => [key, values[index] ?? ""])
    ) as unknown as CsvRow;
    rows.push(row);
  }

  return rows;
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeRegion(value: string): { district: string; subCounty?: string } {
  const raw = value.trim();
  if (!raw || raw.toLowerCase() === "n/a") {
    return { district: "Unspecified District" };
  }

  const cleaned = raw.replace(/\s+/g, " ").trim();
  return {
    district: toTitleCase(cleaned),
    subCounty: undefined,
  };
}

function estimateGoal(name: string): number {
  const base = Math.max(250, Math.min(1200, name.length * 15));
  return base * 150 * 100;
}

function buildSchool(row: CsvRow): ImportSchoolRow | null {
  const name = row["Institution Name"]?.trim();
  const lat = Number(row.Latitude);
  const lng = Number(row.Longitude);
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const region = normalizeRegion(row["City/Region"] ?? "");
  const goal = estimateGoal(name);

  return {
    name,
    district: region.district,
    subCounty: region.subCounty,
    location: { type: "Point", coordinates: [lng, lat] },
    lat,
    lng,
    totalRooms: 0,
    studentCount: 0,
    netsCount: 0,
    hasMalariaClub: false,
    photos: [],
    sponsorshipStatus: "needs-funding",
    status: "pending",
    fundingProgress: { raised: 0, goal },
    notes:
      "Imported from Uganda_Schools_Master_Database.csv. Operational fields still need Pilgrim verification.",
    source: "master-csv",
    sourceFile: "Uganda_Schools_Master_Database.csv",
    importedAt: new Date(),
  };
}

async function run(): Promise<void> {
  const { file, limit } = parseArgs(process.argv.slice(2));
  const resolved = path.resolve(file);
  const raw = fs.readFileSync(resolved, "utf8");
  const rows = parseCsv(raw);

  const prepared: ImportSchoolRow[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const school = buildSchool(row);
    if (!school) continue;
    const dedupeKey = `${school.name.toLowerCase()}|${school.lat}|${school.lng}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    prepared.push(school);
    if (prepared.length >= limit) break;
  }

  logger.info(
    { file: resolved, parsedRows: rows.length, importing: prepared.length },
    "Prepared school import from master CSV"
  );

  await mongoose.connect(MONGO_URI);

  let created = 0;
  let skipped = 0;
  for (const school of prepared) {
    const exists = await School.findOne({
      name: school.name,
      lat: school.lat,
      lng: school.lng,
    }).lean();

    if (exists) {
      skipped += 1;
      continue;
    }

    await School.create(school);
    created += 1;
  }

  logger.info(
    { created, skipped, totalCandidates: prepared.length },
    "School import complete"
  );

  await mongoose.disconnect();
}

run().catch(async (error) => {
  logger.error({ err: error }, "School import failed");
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
