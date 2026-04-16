import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    version: process.env.API_VERSION || "v1",
    ts: Date.now(),
  });
});

export default router;
