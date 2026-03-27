const express = require('express');
const School = require('../models/School');
const SprayReport = require('../models/SprayReport');

const router = express.Router();

// GET /api/stats/impact — public aggregate stats
router.get('/impact', async (req, res, next) => {
  try {
    const totalSchools = await School.countDocuments();
    const totalSprayReports = await SprayReport.countDocuments();

    // Sum all rooms sprayed
    const roomsAgg = await SprayReport.aggregate([
      { $group: { _id: null, total: { $sum: '$roomsSprayed' } } },
    ]);
    const totalRoomsSprayed = roomsAgg.length > 0 ? roomsAgg[0].total : 0;

    // Sum students from schools that have been sprayed (active or completed)
    const studentsAgg = await School.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$studentCount' } } },
    ]);
    const totalStudentsProtected = studentsAgg.length > 0 ? studentsAgg[0].total : 0;

    res.json({
      totalSchools,
      totalRoomsSprayed,
      totalStudentsProtected,
      totalSprayReports,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/map — GeoJSON FeatureCollection for Leaflet
router.get('/map', async (req, res, next) => {
  try {
    const schools = await School.find();

    // Count spray reports per school
    const reportCounts = await SprayReport.aggregate([
      { $group: { _id: '$school', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    reportCounts.forEach((r) => {
      countMap[r._id.toString()] = r.count;
    });

    const features = schools.map((school) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
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
      type: 'FeatureCollection',
      features,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/timeline — monthly spray data
router.get('/timeline', async (req, res, next) => {
  try {
    const timeline = await SprayReport.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          roomsSprayed: { $sum: '$roomsSprayed' },
          reportsCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const formatted = timeline.map((entry) => ({
      month: `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}`,
      roomsSprayed: entry.roomsSprayed,
      reportsCount: entry.reportsCount,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
