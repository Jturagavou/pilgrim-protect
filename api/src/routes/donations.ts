import { Router, type RequestHandler } from "express";
import Donation from "../models/Donation";
import { protect, authorize } from "../middleware/auth";

const router = Router();

// POST /api/donations/checkout — mock Stripe checkout
const checkout: RequestHandler = async (req, res, next) => {
  try {
    const { schoolId, amount, recurring } = req.body as {
      schoolId?: string | null;
      amount?: number;
      recurring?: boolean;
    };

    if (!amount || amount <= 0) {
      res
        .status(400)
        .json({ error: "Amount must be a positive number (in cents)" });
      return;
    }

    const donation = await Donation.create({
      donor: req.user!._id,
      school: schoolId || null,
      amount,
      recurring: recurring || false,
      stripePaymentId: `mock_pi_${Date.now()}`,
      status: "completed",
    });

    const sessionUrl = `https://checkout.stripe.com/mock/session_${donation._id}`;
    res.json({ sessionUrl });
  } catch (error) {
    next(error);
  }
};

// GET /api/donations/mine — donor's own donations
const mine: RequestHandler = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user!._id })
      .populate("school", "name district")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    next(error);
  }
};

router.post("/checkout", protect, authorize("donor"), checkout);
router.get("/mine", protect, authorize("donor"), mine);

export default router;
