const express = require('express');
const School = require('../models/School');
const SprayReport = require('../models/SprayReport');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/schools — public, returns all schools
router.get('/', async (req, res, next) => {
  try {
    const schools = await School.find().sort({ name: 1 });
    res.json(schools);
  } catch (error) {
    next(error);
  }
});

// GET /api/schools/:id — public, returns school + spray reports
router.get('/:id', async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id).populate('sponsor', 'name email');

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Fetch spray reports for this school
    const sprayReports = await SprayReport.find({ school: school._id })
      .populate('worker', 'name')
      .sort({ date: -1 });

    res.json({
      ...school.toObject(),
      sprayReports,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/schools — admin only
router.post('/', protect, authorize('admin'), async (req, res, next) => {
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
});

// PUT /api/schools/:id — admin only
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
