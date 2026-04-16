import { Router } from "express";
import authRoutes from "./auth";
import schoolRoutes from "./schools";
import sprayReportRoutes from "./sprayReports";
import donationRoutes from "./donations";
import statsRoutes from "./stats";
import uploadRoutes from "./upload";

const v1 = Router();

v1.use("/auth", authRoutes);
v1.use("/schools", schoolRoutes);
v1.use("/spray-reports", sprayReportRoutes);
v1.use("/donations", donationRoutes);
v1.use("/stats", statsRoutes);
v1.use("/upload", uploadRoutes);

export default v1;
