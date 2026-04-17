import { Router, type RequestHandler } from "express";
import School, {
  SPONSORSHIP_STATUSES,
  type SponsorshipStatus,
} from "../../models/School";
import SprayReport from "../../models/SprayReport";
import { protect, authorize } from "../../middleware/auth";

const router = Router();

function parseCoord(body: Record<string, unknown>): {
  lat: number;
  lng: number;
  location: { type: "Point"; coordinates: [number, number] };
} | null {
  const loc = body.location as
    | { type?: string; coordinates?: [number, number] }
    | undefined;
  if (
    loc?.coordinates &&
    Array.isArray(loc.coordinates) &&
    loc.coordinates.length >= 2
  ) {
    const lng = Number(loc.coordinates[0]);
    const lat = Number(loc.coordinates[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      lat,
      lng,
      location: { type: "Point", coordinates: [lng, lat] },
    };
  }
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat,
    lng,
    location: { type: "Point", coordinates: [lng, lat] },
  };
}

function normalizeSponsorshipStatus(
  raw: unknown
): SponsorshipStatus | undefined {
  if (typeof raw !== "string") return undefined;
  return SPONSORSHIP_STATUSES.includes(raw as SponsorshipStatus)
    ? (raw as SponsorshipStatus)
    : undefined;
}

// GET /api/schools — public, returns all schools
const listSchools: RequestHandler = async (_req, res, next) => {
  try {
    const schools = await School.find().sort({ name: 1 });
    res.json(schools);
  } catch (error) {
    next(error);
  }
};

// GET /api/schools/:id — public, returns school + spray reports
const getSchool: RequestHandler = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id).populate(
      "sponsor",
      "name email"
    );

    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }

    const sprayReports = await SprayReport.find({ school: school._id })
      .populate("worker", "name")
      .sort({ date: -1 });

    res.json({
      ...school.toObject(),
      sprayReports,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/schools — admin only
const createSchool: RequestHandler = async (req, res, next) => {
  try {
    const b = req.body as Record<string, unknown>;
    const name = String(b.name ?? "").trim();
    const district = String(b.district ?? "").trim();
    if (!name || !district) {
      res.status(400).json({ error: "name and district are required" });
      return;
    }
    const coords = parseCoord(b);
    if (!coords) {
      res
        .status(400)
        .json({ error: "Provide lat and lng, or location.coordinates [lng, lat]" });
      return;
    }
    const subCounty =
      b.subCounty != null ? String(b.subCounty).trim() : undefined;
    const sponsorshipStatus =
      normalizeSponsorshipStatus(b.sponsorshipStatus) ?? "needs-funding";

    const school = await School.create({
      name,
      district,
      subCounty,
      ...coords,
      totalRooms: Number(b.totalRooms) >= 0 ? Number(b.totalRooms) : 0,
      studentCount: Number(b.studentCount) >= 0 ? Number(b.studentCount) : 0,
      netsCount: Number(b.netsCount) >= 0 ? Number(b.netsCount) : 0,
      hasMalariaClub: Boolean(b.hasMalariaClub),
      photos: Array.isArray(b.photos)
        ? (b.photos as unknown[]).filter((u) => typeof u === "string")
        : [],
      sponsorshipStatus,
      fundingProgress:
        b.fundingProgress &&
        typeof b.fundingProgress === "object" &&
        b.fundingProgress !== null
          ? {
              raised: Number(
                (b.fundingProgress as { raised?: number }).raised ?? 0
              ),
              goal: Number((b.fundingProgress as { goal?: number }).goal ?? 0),
            }
          : { raised: 0, goal: 0 },
      notes: b.notes != null ? String(b.notes) : undefined,
      status: b.status === "active" || b.status === "completed" ? b.status : "pending",
    });
    res.status(201).json(school);
  } catch (error) {
    next(error);
  }
};

// PUT /api/schools/:id — admin only
const updateSchool: RequestHandler = async (req, res, next) => {
  try {
    const b = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = { ...b };

    if ("lat" in b || "lng" in b || "location" in b) {
      const coords = parseCoord(b);
      if (!coords) {
        res.status(400).json({
          error: "Invalid coordinates — use lat/lng or location.coordinates",
        });
        return;
      }
      Object.assign(patch, coords);
    }

    if ("sponsorshipStatus" in b) {
      const s = normalizeSponsorshipStatus(b.sponsorshipStatus);
      if (s) patch.sponsorshipStatus = s;
      else delete patch.sponsorshipStatus;
    }

    const school = await School.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });

    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }

    res.json(school);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/schools/:id — admin only
const deleteSchool: RequestHandler = async (req, res, next) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }
    await SprayReport.deleteMany({ school: school._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// POST /api/schools/bulk — admin only (array of school payloads, same shape as POST)
const bulkCreateSchools: RequestHandler = async (req, res, next) => {
  try {
    const { schools } = req.body as { schools?: unknown };
    if (!Array.isArray(schools) || schools.length === 0) {
      res.status(400).json({ error: "Body must include non-empty schools[]" });
      return;
    }

    const created: InstanceType<typeof School>[] = [];
    const errors: { index: number; message: string }[] = [];

    for (let i = 0; i < schools.length; i += 1) {
      const row = schools[i] as Record<string, unknown>;
      const name = String(row.name ?? "").trim();
      const district = String(row.district ?? "").trim();
      const coords = parseCoord(row);
      if (!name || !district || !coords) {
        errors.push({
          index: i,
          message: "Missing name, district, or valid coordinates",
        });
        continue;
      }
      try {
        const doc = await School.create({
          name,
          district,
          subCounty:
            row.subCounty != null ? String(row.subCounty).trim() : undefined,
          ...coords,
          totalRooms: Number(row.totalRooms) >= 0 ? Number(row.totalRooms) : 0,
          studentCount:
            Number(row.studentCount) >= 0 ? Number(row.studentCount) : 0,
          netsCount: Number(row.netsCount) >= 0 ? Number(row.netsCount) : 0,
          hasMalariaClub: Boolean(
            row.hasMalariaClub === true ||
              row.hasMalariaClub === "true" ||
              row.hasMalariaClub === "yes" ||
              row.hasMalariaClub === "1"
          ),
          photos: [],
          sponsorshipStatus:
            normalizeSponsorshipStatus(row.sponsorshipStatus) ?? "needs-funding",
          fundingProgress: { raised: 0, goal: 0 },
          status: "pending",
        });
        created.push(doc);
      } catch (e) {
        errors.push({
          index: i,
          message: e instanceof Error ? e.message : "Create failed",
        });
      }
    }

    res.status(201).json({
      created: created.length,
      schools: created,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

router.get("/", listSchools);
router.post(
  "/bulk",
  protect,
  authorize("admin", "super_admin"),
  bulkCreateSchools
);
router.get("/:id", getSchool);
router.post("/", protect, authorize("admin", "super_admin"), createSchool);
router.put("/:id", protect, authorize("admin", "super_admin"), updateSchool);
router.delete("/:id", protect, authorize("admin", "super_admin"), deleteSchool);

export default router;
