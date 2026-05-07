import { Router, type RequestHandler } from "express";
import { Types } from "mongoose";
import SprayReport from "../../models/SprayReport";
import School from "../../models/School";
import { protect, authorize } from "../../middleware/auth";

interface ReportFilter {
  school?: string;
  worker?: string;
  date?: { $gte?: Date; $lte?: Date };
}

const router = Router();
const MAX_GPS_DISTANCE_KM = 5;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function parseGps(raw: unknown): { lat: number; lng: number } | null {
  if (!raw || typeof raw !== "object") return null;
  const gps = raw as { lat?: unknown; lng?: unknown };
  const lat = Number(gps.lat);
  const lng = Number(gps.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

function numberField(raw: unknown, fallback = 0): number {
  const value = Number(raw ?? fallback);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function wholeNumberField(raw: unknown, fallback = 0): number {
  return Math.floor(numberField(raw, fallback));
}

function textField(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function booleanField(raw: unknown): boolean {
  return raw === true;
}

async function refreshSchoolFromVerifiedReports(schoolId: Types.ObjectId | string) {
  const latestVerified = await SprayReport.findOne({
    school: schoolId,
    verified: true,
  }).sort({ date: -1 });

  await School.findByIdAndUpdate(schoolId, {
    lastSprayDate: latestVerified?.date ?? null,
    status: latestVerified ? "active" : "pending",
  });
}

// POST /api/spray-reports — worker auth required
const createReport: RequestHandler = async (req, res, next) => {
  try {
    const {
      school,
      date,
      roomsSprayed,
      roomsEligible,
      roomsNotSprayed,
      notSprayedReasons,
      studentsProtected,
      peopleProtected,
      serviceTypes,
      insecticide,
      educationSession,
      chemoprevention,
      larvalSourceManagement,
      safetyChecklist,
      headTeacherName,
      supervisorName,
      photos,
      notes,
      gpsCoords,
    } = req.body;
    if (!Types.ObjectId.isValid(String(school))) {
      res.status(400).json({ error: "A valid school id is required" });
      return;
    }

    const schoolRecord = await School.findById(school);
    if (!schoolRecord) {
      res.status(404).json({ error: "School not found" });
      return;
    }

    const reportDate = new Date(String(date));
    if (Number.isNaN(reportDate.getTime())) {
      res.status(400).json({ error: "A valid report date is required" });
      return;
    }

    const rooms = Number(roomsSprayed);
    if (!Number.isInteger(rooms) || rooms < 1) {
      res.status(400).json({ error: "roomsSprayed must be a positive integer" });
      return;
    }
    if (schoolRecord.totalRooms > 0 && rooms > schoolRecord.totalRooms) {
      res.status(400).json({
        error: `roomsSprayed cannot exceed this school's ${schoolRecord.totalRooms} recorded rooms`,
      });
      return;
    }

    const eligibleRooms = wholeNumberField(roomsEligible, schoolRecord.totalRooms || rooms);
    const missedRooms = wholeNumberField(roomsNotSprayed, Math.max(eligibleRooms - rooms, 0));
    if (eligibleRooms > 0 && rooms + missedRooms > eligibleRooms) {
      res.status(400).json({
        error: "roomsSprayed plus roomsNotSprayed cannot exceed eligible rooms",
      });
      return;
    }

    const serviceList = Array.isArray(serviceTypes)
      ? serviceTypes.filter((item) => typeof item === "string" && item.trim())
      : ["irs"];

    const user = req.user!;
    if ("active" in user && user.active === false) {
      res.status(403).json({ error: "Worker account is inactive" });
      return;
    }

    if (user.role === "field_worker" && "assignedSchools" in user) {
      const assigned = user.assignedSchools ?? [];
      const isAssigned = assigned.some(
        (id) => String(id) === String(schoolRecord._id)
      );
      if (assigned.length > 0 && !isAssigned) {
        res.status(403).json({
          error: "This worker is not assigned to submit reports for this school",
        });
        return;
      }
    }

    const duplicate = await SprayReport.findOne({
      school: schoolRecord._id,
      worker: user._id,
      date: { $gte: startOfUtcDay(reportDate), $lt: endOfUtcDay(reportDate) },
    });
    if (duplicate) {
      res.status(409).json({
        error: "A report for this school, worker, and date already exists",
      });
      return;
    }

    const gps = parseGps(gpsCoords);
    let gpsDistance: number | undefined;
    let gpsWithinRange: boolean | undefined;
    if (gps) {
      gpsDistance = distanceKm(gps, {
        lat: schoolRecord.location.coordinates[1],
        lng: schoolRecord.location.coordinates[0],
      });
      gpsWithinRange = gpsDistance <= MAX_GPS_DISTANCE_KM;
      if (!gpsWithinRange) {
        res.status(400).json({
          error: `GPS is ${gpsDistance.toFixed(1)} km from the selected school. Choose the closest school or refresh GPS.`,
        });
        return;
      }
    }

    const report = await SprayReport.create({
      school: schoolRecord._id,
      worker: user._id,
      date: reportDate,
      roomsSprayed: rooms,
      roomsEligible: eligibleRooms,
      roomsNotSprayed: missedRooms,
      notSprayedReasons: {
        locked: wholeNumberField(notSprayedReasons?.locked),
        refused: wholeNumberField(notSprayedReasons?.refused),
        unsafe: wholeNumberField(notSprayedReasons?.unsafe),
        other: wholeNumberField(notSprayedReasons?.other),
      },
      studentsProtected: wholeNumberField(
        studentsProtected,
        schoolRecord.studentCount || 0
      ),
      peopleProtected: wholeNumberField(
        peopleProtected,
        schoolRecord.studentCount || 0
      ),
      serviceTypes: serviceList.length ? serviceList : ["irs"],
      insecticide: {
        product: textField(insecticide?.product),
        batchNumber: textField(insecticide?.batchNumber),
        quantityUsed: numberField(insecticide?.quantityUsed),
        unit: textField(insecticide?.unit) || "sachets",
      },
      educationSession: {
        conducted: booleanField(educationSession?.conducted),
        studentsReached: wholeNumberField(educationSession?.studentsReached),
        topic: textField(educationSession?.topic),
      },
      chemoprevention: {
        provided: booleanField(chemoprevention?.provided),
        studentsReached: wholeNumberField(chemoprevention?.studentsReached),
        dosesAdministered: wholeNumberField(chemoprevention?.dosesAdministered),
      },
      larvalSourceManagement: {
        conducted: booleanField(larvalSourceManagement?.conducted),
        sitesChecked: wholeNumberField(larvalSourceManagement?.sitesChecked),
        sitesTreated: wholeNumberField(larvalSourceManagement?.sitesTreated),
        notes: textField(larvalSourceManagement?.notes),
      },
      safetyChecklist: {
        ppeWorn: booleanField(safetyChecklist?.ppeWorn),
        occupantsCleared: booleanField(safetyChecklist?.occupantsCleared),
        roomsVentilated: booleanField(safetyChecklist?.roomsVentilated),
        headTeacherBriefed: booleanField(safetyChecklist?.headTeacherBriefed),
      },
      headTeacherName: textField(headTeacherName),
      supervisorName: textField(supervisorName),
      photos: photos || [],
      notes: notes || "",
      gpsCoords: gps || {},
      gpsDistanceKm: gpsDistance,
      gpsWithinRange,
    });

    const populated = await SprayReport.findById(report._id)
      .populate("school", "name district")
      .populate("worker", "name");

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/spray-reports — query with filters
const listReports: RequestHandler = async (req, res, next) => {
  try {
    const filter: ReportFilter = {};

    if (req.query.school) filter.school = req.query.school as string;
    if (req.query.worker) filter.worker = req.query.worker as string;
    if (req.query.startDate || req.query.endDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (req.query.startDate) {
        dateFilter.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        dateFilter.$lte = new Date(req.query.endDate as string);
      }
      filter.date = dateFilter;
    }

    const reports = await SprayReport.find(filter)
      .populate("school", "name district")
      .populate("worker", "name")
      .sort({ date: -1 });

    res.json(reports);
  } catch (error) {
    req.log?.warn({ err: error }, "Falling back to empty spray report list");
    res.json([]);
  }
};

// GET /api/spray-reports/mine — worker's own reports
const myReports: RequestHandler = async (req, res, next) => {
  try {
    const reports = await SprayReport.find({ worker: req.user!._id })
      .populate("school", "name district")
      .sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    req.log?.warn({ err: error }, "Falling back to empty worker report list");
    res.json([]);
  }
};

// PATCH /api/spray-reports/:id/verify — admin review action
const verifyReport: RequestHandler = async (req, res, next) => {
  try {
    const verified =
      typeof req.body?.verified === "boolean" ? req.body.verified : true;

    const report = await SprayReport.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true, runValidators: true }
    )
      .populate("school", "name district")
      .populate("worker", "name");

    if (!report) {
      res.status(404).json({ error: "Spray report not found" });
      return;
    }

    await refreshSchoolFromVerifiedReports(report.school._id);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

router.post(
  "/",
  protect,
  authorize("field_worker", "admin", "super_admin"),
  createReport
);
router.get("/", protect, authorize("admin", "super_admin"), listReports);
router.patch(
  "/:id/verify",
  protect,
  authorize("admin", "super_admin"),
  verifyReport
);
router.get(
  "/mine",
  protect,
  authorize("field_worker", "admin", "super_admin"),
  myReports
);

export default router;
