import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { tripService } from "../services/trip.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  aiTripInputSchema,
  createItineraryItemSchema,
  reorderItinerarySchema,
  tripParamsSchema,
  updateTripSchema
} from "../validators/trip.validator.js";

export const tripRoutes = Router();

tripRoutes.use(requireAuth);

tripRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    const trips = await tripService.list(req.user!.id);
    res.json({ trips });
  })
);

tripRoutes.post(
  "/",
  validate(aiTripInputSchema),
  asyncHandler(async (req, res) => {
    const trip = await tripService.createFromAi(req.user!.id, req.body);
    res.status(201).json({ trip });
  })
);

tripRoutes.get(
  "/:tripId",
  validate(tripParamsSchema),
  asyncHandler(async (req, res) => {
    const { tripId } = req.params as { tripId: string };
    const trip = await tripService.getById(tripId, req.user!.id);
    res.json({ trip });
  })
);

tripRoutes.patch(
  "/:tripId",
  validate(updateTripSchema),
  asyncHandler(async (req, res) => {
    const { tripId } = req.params as { tripId: string };
    const trip = await tripService.update(tripId, req.user!.id, req.body);
    res.json({ trip });
  })
);

tripRoutes.delete(
  "/:tripId",
  validate(tripParamsSchema),
  asyncHandler(async (req, res) => {
    const { tripId } = req.params as { tripId: string };
    const result = await tripService.delete(tripId, req.user!.id);
    res.json(result);
  })
);

tripRoutes.post(
  "/:tripId/itinerary",
  validate(createItineraryItemSchema),
  asyncHandler(async (req, res) => {
    const { tripId } = req.params as { tripId: string };
    const item = await tripService.addItineraryItem(tripId, req.user!.id, req.body);
    res.status(201).json({ item });
  })
);

tripRoutes.patch(
  "/:tripId/itinerary/reorder",
  validate(reorderItinerarySchema),
  asyncHandler(async (req, res) => {
    const { tripId } = req.params as { tripId: string };
    const trip = await tripService.reorderItinerary(tripId, req.user!.id, req.body);
    res.json({ trip });
  })
);
