import { Router, type RequestHandler } from "express";
import School from "../models/School";
import SprayReport from "../models/SprayReport";

const router = Router();

interface SchoolReportCount {
  _id: { toString(): string };
  count: number;
}

interface RoomsAgg {
  _id: null;
  total: number;
}

interface TimelineAgg {
  _id: { year: number; month: number };
  roomsSprayed: number;
  reportsCount: number;
}

// GET /api/stats/impact — public aggregate stats
const impact: RequestHandler = async (_req, res, next) => {
  try {
    const totalSchools = await School.countDocuments();
    const totalSprayReports = await SprayReport.countDocuments();

    const roomsAgg = (await SprayReport.aggregate([
      { $group: { _id: null, total: { $sum: "$roomsSprayed" } } },
    ])) as RoomsAgg[];
    const totalRoomsSprayed = roomsAgg.length > 0 ? roomsAgg[0].total : 0;

    const studentsAgg = (await School.aggregate([
      { $match: { status: { $in: ["active", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$studentCount" } } },
    ])) as RoomsAgg[];
    const totalStudentsProtected =
      studentsAgg.length > 0 ? studentsAgg[0].total : 0;

    res.json({
      totalSchools,
      totalRoomsSprayed,
      totalStudentsProtected,
      totalSprayReports,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/map — GeoJSON FeatureCollection for Leaflet
const map: RequestHandler = async (_req, res, next) => {
  try {
    const schools = await School.find();

    const reportCounts = (await SprayReport.aggregate([
      { $group: { _id: "$school", count: { $sum: 1 } } },
    ])) as SchoolReportCount[];

    const countMap: Record<string, number> = {};
    reportCounts.forEach((r) => {
      countMap[r._id.toString()] = r.count;
    });

    const features = schools.map((school) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: school.location.coordinates,
      },
      properties: {
        _id: school._id,
        name: school.name,
        district: school.district,
        studentCount: school.studentCount,
        totalRooms: school.totalRooms,
        status: school.status,
        lastSprayDate: school.lastSprayDate,
        totalSprayReports: countMap[school._id.toString()] || 0,
        thumbnailUrl: school.photos.length > 0 ? school.photos[0] : null,
      },
    }));

    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/timeline — monthly spray data
const timeline: RequestHandler = async (_req, res, next) => {
  try {
    const results = (await SprayReport.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          roomsSprayed: { $sum: "$roomsSprayed" },
          reportsCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])) as TimelineAgg[];

    const formatted = results.map((entry) => ({
      month: `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`,
      roomsSprayed: entry.roomsSprayed,
      reportsCount: entry.reportsCount,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

router.get("/impact", impact);
router.get("/map", map);
router.get("/timeline", timeline);

export default router;
