import { Router } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const dashboardRoutes = Router();

dashboardRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getOverview(req.user!.id);
    res.json({ dashboard });
  })
);
