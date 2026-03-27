const express = require('express');
const Donation = require('../models/Donation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/donations/checkout — mock Stripe checkout
router.post('/checkout', protect, authorize('donor'), async (req, res, next) => {
  try {
    const { schoolId, amount, recurring } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number (in cents)' });
    }

    // Create donation record
    const donation = await Donation.create({
      donor: req.user._id,
      school: schoolId || null,
      amount,
      recurring: recurring || false,
      stripePaymentId: `mock_pi_${Date.now()}`,
      status: 'completed', // mock: auto-complete
    });

    // Mock Stripe checkout session URL
    const sessionUrl = `https://checkout.stripe.com/mock/session_${donation._id}`;

    res.json({ sessionUrl });
  } catch (error) {
    next(error);
  }
});

// GET /api/donations/mine — donor's own donations
router.get('/mine', protect, authorize('donor'), async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('school', 'name district')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
