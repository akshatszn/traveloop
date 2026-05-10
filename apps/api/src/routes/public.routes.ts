import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { tripService } from "../services/trip.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { shareParamsSchema } from "../validators/trip.validator.js";

export const publicRoutes = Router();

publicRoutes.get(
  "/trips/:slug",
  validate(shareParamsSchema),
  asyncHandler(async (req, res) => {
    const { slug } = req.params as { slug: string };
    const trip = await tripService.getPublicBySlug(slug);
    res.json({ trip });
  })
);
