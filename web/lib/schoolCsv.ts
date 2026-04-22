/** Parse simple CSV (no quoted commas) for school bulk import. */

export interface SchoolBulkRow {
  name: string;
  district: string;
  subCounty?: string;
  lng: number;
  lat: number;
  studentCount: number;
  totalRooms: number;
  netsCount: number;
  hasMalariaClub: boolean;
  sponsorshipStatus?: string;
  source?: "manual-csv" | "master-csv";
  sourceFile?: string;
}

const BOOL_TRUE = new Set(["true", "1", "yes", "y"]);

function splitLine(line: string): string[] {
  return line.split(",").map((c) => c.trim());
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function firstPresent(
  header: string[],
  cols: string[],
  names: string[]
): string {
  for (const name of names) {
    const index = header.indexOf(name);
    if (index >= 0) return cols[index] ?? "";
  }
  return "";
}

export function parseSchoolCsv(text: string): SchoolBulkRow[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = splitLine(lines[0]).map(normalizeHeader);
  const hasLat =
    header.includes("lat") || header.includes("latitude");
  const hasLng =
    header.includes("lng") ||
    header.includes("longitude") ||
    header.includes("long");
  const hasName =
    header.includes("name") || header.includes("institutionname");
  const hasDistrict =
    header.includes("district") || header.includes("cityregion");
  const isMasterCsv =
    header.includes("institutionname") && header.includes("cityregion");

  if (!hasName || !hasDistrict || !hasLng || !hasLat) {
    throw new Error(
      `CSV header must include name/institution name, district/city-region, and lat/lng or latitude/longitude. Found: ${header.join(", ")}`
    );
  }

  const out: SchoolBulkRow[] = [];
  for (let r = 1; r < lines.length; r += 1) {
    const cols = splitLine(lines[r]);
    const get = (...names: string[]) => firstPresent(header, cols, names);

    const name = get("name", "institutionname");
    const district = get("district", "cityregion");
    const lng = Number(get("lng", "longitude", "long"));
    const lat = Number(get("lat", "latitude"));
    if (!name || !district || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      continue;
    }
    const sub = get("subcounty", "sub_county");
    const sc = Number(get("studentcount", "students"));
    const tr = Number(get("totalrooms", "rooms"));
    const nets = Number(get("netscount", "nets"));
    const clubRaw = get("hasmalariaclub", "malaria_club").toLowerCase();
    out.push({
      name,
      district,
      subCounty: sub || undefined,
      lng,
      lat,
      studentCount: Number.isFinite(sc) && sc >= 0 ? sc : 0,
      totalRooms: Number.isFinite(tr) && tr >= 0 ? tr : 0,
      netsCount: Number.isFinite(nets) && nets >= 0 ? nets : 0,
      hasMalariaClub: BOOL_TRUE.has(clubRaw),
      sponsorshipStatus: get("sponsorshipstatus", "phase") || undefined,
      source: isMasterCsv ? "master-csv" : "manual-csv",
      sourceFile: isMasterCsv
        ? "Uganda_Schools_Master_Database.csv"
        : "admin-upload.csv",
    });
  }
  return out;
}
