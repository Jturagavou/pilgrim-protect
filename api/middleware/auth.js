const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const Donor = require('../models/Donor');

// Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in Worker or Donor collection based on role
    if (decoded.role === 'worker' || decoded.role === 'supervisor' || decoded.role === 'admin') {
      req.user = await Worker.findById(decoded.id);
    } else if (decoded.role === 'donor') {
      req.user = await Donor.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized — user not found' });
    }

    req.user.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized — invalid token' });
  }
};

// Role-based access guard
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Role "${req.user.role}" is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
