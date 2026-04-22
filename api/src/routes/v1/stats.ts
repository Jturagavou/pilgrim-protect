import { Router, type RequestHandler } from "express";
import School, { HELPED_STATUSES } from "../../models/School";
import SprayReport from "../../models/SprayReport";
import Donation from "../../models/Donation";

const router = Router();

// v1 "school is protected" — now sourced from the v2 sponsorshipStatus enum.
// Legacy `status` kept alongside in the map response for the old dashboard.
const PROTECTED_LEGACY = ["active", "completed"] as const;
const GOAL_STUDENTS = 100_000;

const fallbackSummary = () => ({
  schoolsProtected: 0,
  studentsCovered: 0,
  dollarsRaised: 0,
  goal: GOAL_STUDENTS,
  progressPct: 0,
  updatedAt: new Date().toISOString(),
});

const fallbackMap = {
  type: "FeatureCollection",
  features: [],
};

interface TotalAgg {
  _id: null;
  total: number;
}

interface SchoolReportCount {
  _id: { toString(): string };
  count: number;
}

interface TimelineAgg {
  _id: { year: number; month: number };
  roomsSprayed: number;
  reportsCount: number;
}

// GET /api/v1/stats — homepage summary (schools + students + $ raised + 100k progress)
const summary: RequestHandler = async (req, res, next) => {
  try {
    // Prefer sponsorshipStatus; fall back to legacy `status` for any
    // unmigrated rows (pre-prompt-05 seed data).
    const helpedMatch = {
      $or: [
        { sponsorshipStatus: { $in: HELPED_STATUSES } },
        { status: { $in: PROTECTED_LEGACY } },
      ],
    };

    const [schoolsProtected, studentsAgg, donationsAgg] = await Promise.all([
      School.countDocuments(helpedMatch),
      School.aggregate<TotalAgg>([
        { $match: helpedMatch },
        { $group: { _id: null, total: { $sum: "$studentCount" } } },
      ]),
      Donation.aggregate<TotalAgg>([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const studentsCovered = studentsAgg[0]?.total ?? 0;
    // Donation.amount is stored in cents — homepage wants dollars.
    const dollarsRaised = Math.round((donationsAgg[0]?.total ?? 0) / 100);
    const goal = GOAL_STUDENTS;
    const progressPct = Math.min(1, studentsCovered / goal);

    res.json({
      schoolsProtected,
      studentsCovered,
      dollarsRaised,
      goal,
      progressPct,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    req.log?.warn({ err: error }, "Falling back to empty stats summary");
    res.json(fallbackSummary());
  }
};

// GET /api/v1/stats/impact — legacy dashboard metrics (kept for backward compat
// until the dashboard page migrates to the /stats summary endpoint).
const impact: RequestHandler = async (req, res, next) => {
  try {
    const totalSchools = await School.countDocuments();
    const totalSprayReports = await SprayReport.countDocuments();

    const roomsAgg = await SprayReport.aggregate<TotalAgg>([
      { $group: { _id: null, total: { $sum: "$roomsSprayed" } } },
    ]);
    const totalRoomsSprayed = roomsAgg.length > 0 ? roomsAgg[0].total : 0;

    const studentsAgg = await School.aggregate<TotalAgg>([
      {
        $match: {
          $or: [
            { sponsorshipStatus: { $in: HELPED_STATUSES } },
            { status: { $in: PROTECTED_LEGACY } },
          ],
        },
      },
      { $group: { _id: null, total: { $sum: "$studentCount" } } },
    ]);
    const totalStudentsProtected =
      studentsAgg.length > 0 ? studentsAgg[0].total : 0;

    res.json({
      totalSchools,
      totalRoomsSprayed,
      totalStudentsProtected,
      totalSprayReports,
    });
  } catch (error) {
    req.log?.warn({ err: error }, "Falling back to empty impact stats");
    res.json({
      totalSchools: 0,
      totalRoomsSprayed: 0,
      totalStudentsProtected: 0,
      totalSprayReports: 0,
    });
  }
};

// GET /api/stats/map — GeoJSON FeatureCollection for Leaflet
const map: RequestHandler = async (req, res, next) => {
  try {
    const schools = await School.find();

    const reportCounts = (await SprayReport.aggregate([
      { $group: { _id: "$school", count: { $sum: 1 } } },
    ])) as SchoolReportCount[];

    const countMap: Record<string, number> = {};
    reportCounts.forEach((r) => {
      countMap[r._id.toString()] = r.count;
    });

    const features = schools.map((school) => {
      const helped = HELPED_STATUSES.includes(school.sponsorshipStatus);
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: school.location.coordinates,
        },
        properties: {
          _id: school._id,
          name: school.name,
          district: school.district,
          subCounty: school.subCounty,
          studentCount: school.studentCount,
          totalRooms: school.totalRooms,
          netsCount: school.netsCount,
          hasMalariaClub: school.hasMalariaClub,
          sponsorshipStatus: school.sponsorshipStatus,
          gapState: helped ? "helped" : "struggling",
          // Legacy field — retained for the /dashboard page until prompt 07.
          status: school.status,
          lat: school.lat,
          lng: school.lng,
          lastSprayDate: school.lastSprayDate,
          totalSprayReports: countMap[school._id.toString()] || 0,
          thumbnailUrl: school.photos.length > 0 ? school.photos[0] : null,
        },
      };
    });

    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    req.log?.warn({ err: error }, "Falling back to empty map stats");
    res.json(fallbackMap);
  }
};

// GET /api/stats/timeline — monthly spray data
const timeline: RequestHandler = async (req, res, next) => {
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
    req.log?.warn({ err: error }, "Falling back to empty timeline stats");
    res.json([]);
  }
};

router.get("/", summary);
router.get("/impact", impact);
router.get("/map", map);
router.get("/timeline", timeline);

export default router;
