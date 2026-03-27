const express = require('express');
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const Donor = require('../models/Donor');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide name, email, password, and role' });
    }

    if (!['worker', 'donor'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "worker" or "donor"' });
    }

    let user;

    if (role === 'worker') {
      // Check if email already exists
      const existing = await Worker.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      user = await Worker.create({ name, email, password, role: 'worker' });
    } else {
      const existing = await Donor.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      user = await Donor.create({ name, email, password });
    }

    const token = generateToken(user._id, role);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Try Worker first (includes admin and supervisor)
    let user = await Worker.findOne({ email }).select('+password');
    let role = null;

    if (user) {
      role = user.role; // worker | supervisor | admin
    } else {
      // Try Donor
      user = await Donor.findOne({ email }).select('+password');
      if (user) {
        role = 'donor';
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, role);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
