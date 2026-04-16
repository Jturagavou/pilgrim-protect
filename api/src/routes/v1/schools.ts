import { Router, type RequestHandler } from "express";
import School from "../../models/School";
import SprayReport from "../../models/SprayReport";
import { protect, authorize } from "../../middleware/auth";

const router = Router();

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
    const { name, district, location, totalRooms, studentCount } = req.body;
    const school = await School.create({
      name,
      district,
      location,
      totalRooms,
      studentCount,
    });
    res.status(201).json(school);
  } catch (error) {
    next(error);
  }
};

// PUT /api/schools/:id — admin only
const updateSchool: RequestHandler = async (req, res, next) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, {
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

router.get("/", listSchools);
router.get("/:id", getSchool);
router.post("/", protect, authorize("admin", "super_admin"), createSchool);
router.put("/:id", protect, authorize("admin", "super_admin"), updateSchool);

export default router;
