import { Router, type RequestHandler } from "express";
import SprayReport from "../models/SprayReport";

interface ReportFilter {
  school?: string;
  worker?: string;
  date?: { $gte?: Date; $lte?: Date };
}
import School from "../models/School";
import { protect, authorize } from "../middleware/auth";

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
    next(error);
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
    next(error);
  }
};

router.post(
  "/",
  protect,
  authorize("worker", "supervisor", "admin"),
  createReport
);
router.get("/", listReports);
router.get(
  "/mine",
  protect,
  authorize("worker", "supervisor", "admin"),
  myReports
);

export default router;
