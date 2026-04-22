import { Router, type RequestHandler } from "express";
import SprayReport from "../../models/SprayReport";
import School from "../../models/School";
import { protect, authorize } from "../../middleware/auth";

interface ReportFilter {
  school?: string;
  worker?: string;
  date?: { $gte?: Date; $lte?: Date };
}

const router = Router();

// POST /api/spray-reports — worker auth required
const createReport: RequestHandler = async (req, res, next) => {
  try {
    const { school, date, roomsSprayed, photos, notes, gpsCoords } = req.body;

    const report = await SprayReport.create({
      school,
      worker: req.user!._id,
      date,
      roomsSprayed,
      photos: photos || [],
      notes: notes || "",
      gpsCoords: gpsCoords || {},
    });

    await School.findByIdAndUpdate(school, {
      lastSprayDate: date,
      status: "active",
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
router.get("/", listReports);
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
