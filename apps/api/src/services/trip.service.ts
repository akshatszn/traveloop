import { Prisma, TripVisibility } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma.js";
import { notFound, forbidden } from "../utils/errors.js";
import { aiPlannerService } from "./ai-planner.service.js";
import { budgetService } from "./budget.service.js";
import type {
  AiTripInput,
  CreateItineraryItemInput,
  ReorderItineraryInput
} from "../validators/trip.validator.js";

const tripInclude = {
  owner: {
    select: { id: true, name: true, email: true, avatarUrl: true }
  },
  stops: {
    include: { city: true },
    orderBy: { position: "asc" }
  },
  itineraryItems: {
    include: {
      activity: true,
      stop: {
        include: { city: true }
      }
    },
    orderBy: [{ dayNumber: "asc" }, { position: "asc" }]
  },
  budgets: {
    orderBy: { category: "asc" }
  },
  packingItems: {
    orderBy: [{ packed: "asc" }, { category: "asc" }, { createdAt: "asc" }]
  },
  notes: {
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } }
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }]
  }
} satisfies Prisma.TripInclude;

const compactTripInclude = {
  stops: {
    include: { city: true },
    orderBy: { position: "asc" }
  },
  budgets: true,
  _count: {
    select: {
      itineraryItems: true,
      notes: true,
      packingItems: true
    }
  }
} satisfies Prisma.TripInclude;

const ensureOwnedTrip = async (tripId: string, userId: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, ownerId: true }
  });

  if (!trip) {
    throw notFound("Trip");
  }

  if (trip.ownerId !== userId) {
    throw forbidden("Only the trip owner can change this itinerary");
  }

  return trip;
};

const packingItemsForTrip = (destinations: string[], travelStyle: string) => [
  { label: "Passport, IDs, and digital copies", category: "Essentials" },
  { label: "Compact day bag", category: "Essentials" },
  { label: "Universal adapter and battery pack", category: "Tech" },
  { label: "Weather-flexible outer layer", category: "Clothing" },
  { label: `${destinations[0] ?? "Destination"} walking shoes`, category: "Clothing" },
  { label: `${travelStyle.toLowerCase().replace("_", " ")} outfit anchor`, category: "Style" }
];

export const tripService = {
  async list(userId: string) {
    return prisma.trip.findMany({
      where: { ownerId: userId },
      include: compactTripInclude,
      orderBy: [{ updatedAt: "desc" }]
    });
  },

  async getById(tripId: string, userId: string) {
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, ownerId: userId },
      include: tripInclude
    });

    if (!trip) {
      throw notFound("Trip");
    }

    return trip;
  },

  async createFromAi(userId: string, input: AiTripInput) {
    const plan = await aiPlannerService.generate(input);
    const shareSlug = `${plan.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 42)}-${nanoid(8)}`;

    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          ownerId: userId,
          title: plan.title,
          summary: plan.summary,
          startDate: input.startDate,
          endDate: input.endDate,
          budgetCents: input.budgetCents,
          currency: input.currency.toUpperCase(),
          travelStyle: input.travelStyle,
          visibility: TripVisibility.PRIVATE,
          coverImageUrl: plan.coverImageUrl,
          shareSlug,
          interests: input.interests,
          aiBrief: {
            destinations: input.destinations,
            interests: input.interests,
            rationale: plan.rationale,
            estimatedActivityCostCents: plan.estimatedActivityCostCents,
            generatedAt: new Date().toISOString()
          }
        }
      });

      const stopRecords = await Promise.all(
        plan.stops.map((stop) =>
          tx.tripStop.create({
            data: {
              tripId: trip.id,
              cityId: stop.city.id,
              startDate: stop.startDate,
              endDate: stop.endDate,
              position: stop.position,
              notes: stop.notes
            }
          })
        )
      );

      const stopByPosition = new Map(stopRecords.map((stop) => [stop.position, stop.id]));

      await tx.itineraryItem.createMany({
        data: plan.items.map((item) => ({
          tripId: trip.id,
          stopId: stopByPosition.get(item.stopPosition) ?? null,
          activityId: item.activityId ?? null,
          title: item.title,
          description: item.description,
          category: item.category,
          startTime: item.startTime,
          endTime: item.endTime,
          dayNumber: item.dayNumber,
          position: item.position,
          costCents: item.costCents,
          notes: item.notes ?? null,
          metadata: item.metadata as Prisma.InputJsonValue
        }))
      });

      await tx.budget.createMany({
        data: budgetService.estimate(input.budgetCents, input.currency.toUpperCase(), input.travelStyle).map((line) => ({
          tripId: trip.id,
          ...line
        }))
      });

      await tx.packingItem.createMany({
        data: packingItemsForTrip(
          plan.stops.map((stop) => stop.city.name),
          input.travelStyle
        ).map((item) => ({
          tripId: trip.id,
          ...item
        }))
      });

      await tx.note.create({
        data: {
          tripId: trip.id,
          authorId: userId,
          title: "AI planning brief",
          body: plan.rationale.join("\n"),
          pinned: true
        }
      });

      return tx.trip.findUniqueOrThrow({
        where: { id: trip.id },
        include: tripInclude
      });
    }, { timeout: 30000 });
  },

  async update(tripId: string, userId: string, input: Prisma.TripUpdateInput) {
    await ensureOwnedTrip(tripId, userId);
    return prisma.trip.update({
      where: { id: tripId },
      data: input,
      include: tripInclude
    });
  },

  async delete(tripId: string, userId: string) {
    await ensureOwnedTrip(tripId, userId);
    await prisma.trip.delete({ where: { id: tripId } });
    return { id: tripId };
  },

  async addItineraryItem(tripId: string, userId: string, input: CreateItineraryItemInput) {
    await ensureOwnedTrip(tripId, userId);

    return prisma.itineraryItem.create({
      data: {
        tripId,
        stopId: input.stopId,
        activityId: input.activityId,
        title: input.title,
        description: input.description,
        category: input.category,
        startTime: input.startTime,
        endTime: input.endTime,
        dayNumber: input.dayNumber,
        position: input.position,
        costCents: input.costCents,
        notes: input.notes,
        metadata: {}
      }
    });
  },

  async reorderItinerary(tripId: string, userId: string, input: ReorderItineraryInput) {
    await ensureOwnedTrip(tripId, userId);

    await prisma.$transaction(
      input.items.map((item) =>
        prisma.itineraryItem.update({
          where: { id: item.id, tripId },
          data: {
            dayNumber: item.dayNumber,
            position: item.position,
            startTime: item.startTime,
            endTime: item.endTime
          }
        })
      )
    );

    return this.getById(tripId, userId);
  },

  async getPublicBySlug(slug: string) {
    const trip = await prisma.trip.findUnique({
      where: { shareSlug: slug },
      include: tripInclude
    });

    if (!trip || trip.visibility === "PRIVATE") {
      throw notFound("Public itinerary");
    }

    return trip;
  }
};
