import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { aiPlannerService } from "../services/ai-planner.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { aiTripInputSchema } from "../validators/trip.validator.js";

export const aiRoutes = Router();

aiRoutes.use(requireAuth);

aiRoutes.post(
  "/generate-itinerary",
  validate(aiTripInputSchema),
  asyncHandler(async (req, res) => {
    const plan = await aiPlannerService.generate(req.body);
    res.json({ plan });
  })
);
