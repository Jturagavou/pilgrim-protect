const express = require('express');
const SprayReport = require('../models/SprayReport');
const School = require('../models/School');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/spray-reports — worker auth required
router.post(
  '/',
  protect,
  authorize('worker', 'supervisor', 'admin'),
  async (req, res, next) => {
    try {
      const { school, date, roomsSprayed, photos, notes, gpsCoords } = req.body;

      const report = await SprayReport.create({
        school,
        worker: req.user._id,
        date,
        roomsSprayed,
        photos: photos || [],
        notes: notes || '',
        gpsCoords: gpsCoords || {},
      });

      // Update school's lastSprayDate
      await School.findByIdAndUpdate(school, {
        lastSprayDate: date,
        status: 'active',
      });

      const populated = await SprayReport.findById(report._id)
        .populate('school', 'name district')
        .populate('worker', 'name');

      res.status(201).json(populated);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/spray-reports — query with filters
router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.school) filter.school = req.query.school;
    if (req.query.worker) filter.worker = req.query.worker;
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const reports = await SprayReport.find(filter)
      .populate('school', 'name district')
      .populate('worker', 'name')
      .sort({ date: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
});

// GET /api/spray-reports/mine — worker's own reports
router.get(
  '/mine',
  protect,
  authorize('worker', 'supervisor', 'admin'),
  async (req, res, next) => {
    try {
      const reports = await SprayReport.find({ worker: req.user._id })
        .populate('school', 'name district')
        .sort({ date: -1 });

      res.json(reports);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
