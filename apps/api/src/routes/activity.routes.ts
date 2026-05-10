import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { activityService } from "../services/activity.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { activityQuerySchema } from "../validators/trip.validator.js";

export const activityRoutes = Router();

activityRoutes.get(
  "/",
  validate(activityQuerySchema),
  asyncHandler(async (req, res) => {
    const activities = await activityService.search(req.query);
    res.json({ activities });
  })
);

activityRoutes.get(
  "/cities",
  asyncHandler(async (_req, res) => {
    const cities = await activityService.cities();
    res.json({ cities });
  })
);
