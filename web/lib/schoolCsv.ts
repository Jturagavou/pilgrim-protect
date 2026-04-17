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
}

const BOOL_TRUE = new Set(["true", "1", "yes", "y"]);

function splitLine(line: string): string[] {
  return line.split(",").map((c) => c.trim());
}

export function parseSchoolCsv(text: string): SchoolBulkRow[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/\s/g, ""));
  const idx = (name: string) => header.indexOf(name);

  const need = ["name", "district", "lng", "lat"] as const;
  for (const k of need) {
    if (idx(k) < 0) {
      throw new Error(
        `CSV header must include: ${need.join(", ")}. Found: ${header.join(", ")}`
      );
    }
  }

  const out: SchoolBulkRow[] = [];
  for (let r = 1; r < lines.length; r += 1) {
    const cols = splitLine(lines[r]);
    const get = (h: string) => {
      const i = idx(h);
      return i >= 0 ? cols[i] : "";
    };
    const name = get("name");
    const district = get("district");
    const lng = Number(get("lng"));
    const lat = Number(get("lat"));
    if (!name || !district || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      continue;
    }
    const sub = get("subcounty") || get("sub_county");
    const sc = Number(get("studentcount") || get("students"));
    const tr = Number(get("totalrooms") || get("rooms"));
    const nets = Number(get("netscount") || get("nets"));
    const clubRaw = (get("hasmalariaclub") || get("malaria_club")).toLowerCase();
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
      sponsorshipStatus: get("sponsorshipstatus") || get("phase") || undefined,
    });
  }
  return out;
}
