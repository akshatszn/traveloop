import { ActivityCategory, TravelStyle, TripVisibility } from "@prisma/client";
import { z } from "zod";

const destinationSchema = z.object({
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80).optional(),
  nights: z.number().int().min(1).max(30).optional()
});

export const aiTripInputSchema = z.object({
  body: z
    .object({
      destinations: z.array(destinationSchema).min(1).max(8),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      budgetCents: z.number().int().min(5000).max(100000000),
      currency: z.string().trim().length(3).default("USD"),
      travelStyle: z.nativeEnum(TravelStyle),
      interests: z.array(z.string().trim().min(2).max(40)).min(1).max(12),
      title: z.string().trim().min(3).max(120).optional()
    })
    .refine((data) => data.endDate >= data.startDate, {
      path: ["endDate"],
      message: "End date must be on or after start date"
    })
});

export const updateTripSchema = z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({
    title: z.string().trim().min(3).max(120).optional(),
    summary: z.string().trim().min(12).max(800).optional(),
    visibility: z.nativeEnum(TripVisibility).optional(),
    coverImageUrl: z.string().url().optional()
  })
});

export const tripParamsSchema = z.object({
  params: z.object({ tripId: z.string().uuid() })
});

export const shareParamsSchema = z.object({
  params: z.object({ slug: z.string().trim().min(6).max(80) })
});

export const reorderItinerarySchema = z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({
    items: z
      .array(
        z.object({
          id: z.string().uuid(),
          dayNumber: z.number().int().min(1).max(90),
          position: z.number().int().min(0).max(1000),
          startTime: z.coerce.date().optional(),
          endTime: z.coerce.date().optional()
        })
      )
      .min(1)
      .max(300)
  })
});

export const createItineraryItemSchema = z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({
    stopId: z.string().uuid().optional(),
    activityId: z.string().uuid().optional(),
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(6).max(800),
    category: z.nativeEnum(ActivityCategory),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    dayNumber: z.number().int().min(1).max(90),
    position: z.number().int().min(0).max(1000),
    costCents: z.number().int().min(0).max(10000000),
    notes: z.string().trim().max(800).optional()
  })
});

export const activityQuerySchema = z.object({
  query: z.object({
    cityId: z.string().uuid().optional(),
    q: z.string().trim().max(80).optional(),
    interests: z.string().trim().max(200).optional()
  })
});

export type AiTripInput = z.infer<typeof aiTripInputSchema>["body"];
export type ReorderItineraryInput = z.infer<typeof reorderItinerarySchema>["body"];
export type CreateItineraryItemInput = z.infer<typeof createItineraryItemSchema>["body"];
