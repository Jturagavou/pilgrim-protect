import { Router, type RequestHandler } from "express";
import Donation from "../../models/Donation";
import { protect, authorize } from "../../middleware/auth";

const router = Router();

// POST /api/donations/checkout — not enabled in v1 pilot (no Stripe)
const checkout: RequestHandler = (_req, res) => {
  res.status(410).json({
    error:
      "Online card checkout is not enabled in the v1 pilot. Use Pilgrim Africa’s main giving channels (see the Donate page).",
  });
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
