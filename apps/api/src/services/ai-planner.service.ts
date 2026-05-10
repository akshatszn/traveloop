import { Activity, ActivityCategory, City, TravelStyle } from "@prisma/client";
import {
  addDays,
  addMinutes,
  differenceInCalendarDays,
  format,
  setHours,
  setMinutes,
  startOfDay
} from "date-fns";
import { prisma } from "../lib/prisma.js";
import type { AiTripInput } from "../validators/trip.validator.js";

type DestinationInput = AiTripInput["destinations"][number];

export type PlannedStop = {
  city: City;
  startDate: Date;
  endDate: Date;
  position: number;
  notes: string;
};

export type PlannedItineraryItem = {
  stopPosition: number;
  activityId?: string;
  title: string;
  description: string;
  category: ActivityCategory;
  startTime: Date;
  endTime: Date;
  dayNumber: number;
  position: number;
  costCents: number;
  notes?: string;
  metadata: Record<string, unknown>;
};

export type PlannedTrip = {
  title: string;
  summary: string;
  coverImageUrl: string;
  stops: PlannedStop[];
  items: PlannedItineraryItem[];
  rationale: string[];
  estimatedActivityCostCents: number;
};

const imagePool = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1494475673543-6a6a27143fc8?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=85"
];
const fallbackImage = imagePool[0]!;

const countryCodeByCountry: Record<string, string> = {
  France: "FR",
  Japan: "JP",
  Italy: "IT",
  Spain: "ES",
  Portugal: "PT",
  Thailand: "TH",
  "United States": "US",
  USA: "US",
  India: "IN",
  Greece: "GR",
  Mexico: "MX"
};

const styleCategoryWeights: Record<TravelStyle, Partial<Record<ActivityCategory, number>>> = {
  LUXURY: { FOOD: 1.4, WELLNESS: 1.3, SHOPPING: 1.2, EXPERIENCE: 1.15 },
  BALANCED: { CULTURE: 1.15, FOOD: 1.1, LANDMARK: 1.1, OUTDOORS: 1.05 },
  ADVENTURE: { OUTDOORS: 1.5, EXPERIENCE: 1.25, TRANSIT: 1.1, LANDMARK: 1.05 },
  CULTURE: { CULTURE: 1.5, LANDMARK: 1.25, FOOD: 1.15, EXPERIENCE: 1.1 },
  RELAXED: { WELLNESS: 1.4, FOOD: 1.2, SHOPPING: 1.05, OUTDOORS: 1.05 },
  FAMILY: { LANDMARK: 1.25, OUTDOORS: 1.2, FOOD: 1.1, CULTURE: 1.05 },
  REMOTE_WORK: { FOOD: 1.2, CULTURE: 1.1, WELLNESS: 1.1, OUTDOORS: 1.05 }
};

const categoryFromInterest = (interest: string): ActivityCategory => {
  const normalized = interest.toLowerCase();
  if (/(food|coffee|wine|bar|restaurant|dining|market)/.test(normalized)) return "FOOD";
  if (/(museum|art|history|culture|architecture|gallery)/.test(normalized)) return "CULTURE";
  if (/(hike|nature|park|surf|outdoor|beach|mountain)/.test(normalized)) return "OUTDOORS";
  if (/(spa|yoga|wellness|slow|rest)/.test(normalized)) return "WELLNESS";
  if (/(shop|fashion|design|vintage)/.test(normalized)) return "SHOPPING";
  if (/(club|cocktail|music|night)/.test(normalized)) return "NIGHTLIFE";
  return "EXPERIENCE";
};

const deterministicNumber = (seed: string, min: number, max: number) => {
  const hash = Array.from(seed).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
  return min + (hash % (max - min + 1));
};

const getCountryCode = (country: string) => countryCodeByCountry[country] ?? country.slice(0, 2).toUpperCase();

const cityDescription = (city: string, country: string, interests: string[]) =>
  `${city} pairs ${interests.slice(0, 3).join(", ")} with a route designed for confident pacing, neighborhood texture, and low-friction logistics in ${country}.`;

const buildDefaultActivities = (city: City, interests: string[]) => {
  const firstInterest = interests[0] ?? "local culture";
  const primaryCategory = categoryFromInterest(firstInterest);
  const image = city.imageUrl;

  return [
    {
      title: `${city.name} neighborhood arrival walk`,
      description: `A gentle orientation through the most walkable local streets with a coffee stop and practical landmarks saved for the rest of the trip.`,
      category: "LANDMARK" as ActivityCategory,
      tags: ["orientation", "walking", "local"],
      priceCents: 0,
      durationMinutes: 90,
      neighborhood: "Central district",
      imageUrl: image,
      rating: 4.7,
      bestTimeOfDay: "morning"
    },
    {
      title: `${city.name} chef-led market tasting`,
      description: `A compact food crawl that balances respected vendors, seasonal bites, and enough flexibility for dietary preferences.`,
      category: "FOOD" as ActivityCategory,
      tags: ["food", "market", "local"],
      priceCents: deterministicNumber(`${city.name}-food`, 2800, 7200),
      durationMinutes: 120,
      neighborhood: "Market quarter",
      imageUrl: image,
      rating: 4.8,
      bestTimeOfDay: "midday"
    },
    {
      title: `${city.name} ${firstInterest} deep dive`,
      description: `A guided block focused on ${firstInterest}, tuned to avoid the busiest windows while keeping transit time modest.`,
      category: primaryCategory,
      tags: [firstInterest.toLowerCase(), "guided", "signature"],
      priceCents: deterministicNumber(`${city.name}-${firstInterest}`, 2000, 9000),
      durationMinutes: 150,
      neighborhood: "Cultural core",
      imageUrl: image,
      rating: 4.75,
      bestTimeOfDay: "afternoon"
    },
    {
      title: `${city.name} golden-hour viewpoint`,
      description: `A late-day stop with a strong sense of place, easy nearby dinner options, and room for photos without rushing.`,
      category: "OUTDOORS" as ActivityCategory,
      tags: ["viewpoint", "photos", "sunset"],
      priceCents: deterministicNumber(`${city.name}-view`, 0, 2600),
      durationMinutes: 90,
      neighborhood: "Scenic edge",
      imageUrl: image,
      rating: 4.65,
      bestTimeOfDay: "evening"
    },
    {
      title: `${city.name} design-led evening table`,
      description: `A reservation-friendly dinner plan near the day's final stop with strong atmosphere and a realistic end time.`,
      category: "FOOD" as ActivityCategory,
      tags: ["dinner", "design", "reservation"],
      priceCents: deterministicNumber(`${city.name}-dinner`, 4500, 11000),
      durationMinutes: 120,
      neighborhood: "Dining district",
      imageUrl: image,
      rating: 4.7,
      bestTimeOfDay: "evening"
    }
  ];
};

const ensureCity = async (destination: DestinationInput, interests: string[], index: number) => {
  const country = destination.country ?? "Global";
  const existing = await prisma.city.findUnique({
    where: {
      name_country: {
        name: destination.city,
        country
      }
    }
  });

  if (existing) return existing;

  const imageUrl = imagePool[index % imagePool.length] ?? fallbackImage;
  return prisma.city.create({
    data: {
      name: destination.city,
      country,
      countryCode: getCountryCode(country),
      timezone: "UTC",
      latitude: deterministicNumber(`${destination.city}-lat`, -6000, 6000) / 100,
      longitude: deterministicNumber(`${destination.city}-lng`, -16000, 16000) / 100,
      imageUrl,
      description: cityDescription(destination.city, country, interests),
      avgDailyCostCents: deterministicNumber(`${destination.city}-daily`, 11000, 42000)
    }
  });
};

const ensureActivities = async (city: City, interests: string[]) => {
  const activities = await prisma.activity.findMany({
    where: { cityId: city.id },
    orderBy: [{ rating: "desc" }, { priceCents: "asc" }]
  });

  if (activities.length >= 5) {
    return activities;
  }

  const existingTitles = new Set(activities.map((activity) => activity.title));
  const missing = buildDefaultActivities(city, interests).filter((activity) => !existingTitles.has(activity.title));

  if (missing.length > 0) {
    await prisma.activity.createMany({
      data: missing.map((activity) => ({
        ...activity,
        cityId: city.id
      })),
      skipDuplicates: true
    });
  }

  return prisma.activity.findMany({
    where: { cityId: city.id },
    orderBy: [{ rating: "desc" }, { priceCents: "asc" }]
  });
};

const allocateDays = (destinations: DestinationInput[], totalDays: number) => {
  const explicitNights = destinations.reduce((sum, destination) => sum + (destination.nights ?? 0), 0);

  if (explicitNights > 0) {
    const raw = destinations.map((destination) => destination.nights ?? Math.max(1, Math.round(totalDays / destinations.length)));
    const total = raw.reduce((sum, value) => sum + value, 0);
    let assigned = 0;

    return raw.map((value, index) => {
      const days = index === raw.length - 1 ? totalDays - assigned : Math.max(1, Math.round((value / total) * totalDays));
      assigned += days;
      return days;
    });
  }

  const base = Math.floor(totalDays / destinations.length);
  const remainder = totalDays % destinations.length;
  return destinations.map((_, index) => Math.max(1, base + (index < remainder ? 1 : 0)));
};

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const scoreActivity = (activity: Activity, input: AiTripInput) => {
  const terms = new Set(input.interests.flatMap((interest) => normalizeText(interest).split(" ")));
  const haystack = normalizeText(`${activity.title} ${activity.description} ${activity.tags.join(" ")} ${activity.category}`);
  const interestScore = Array.from(terms).reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
  const styleScore = styleCategoryWeights[input.travelStyle][activity.category] ?? 1;
  const pricePressure = input.travelStyle === "LUXURY" ? 0 : Math.min(activity.priceCents / Math.max(input.budgetCents, 1), 0.08);

  return interestScore * 2.1 + activity.rating * styleScore - pricePressure * 20;
};

const pickActivity = (
  activities: Activity[],
  input: AiTripInput,
  preferredCategories: ActivityCategory[],
  usedActivityIds: Set<string>,
  dailyTargetCents: number
) => {
  const candidates = activities
    .filter((activity) => preferredCategories.includes(activity.category) || preferredCategories.length === 0)
    .filter((activity) => activity.priceCents <= dailyTargetCents * 0.85 || activity.priceCents < 3000);

  const fallback = candidates.length > 0 ? candidates : activities;

  return [...fallback].sort((a, b) => {
    const usedPenaltyA = usedActivityIds.has(a.id) ? -2.5 : 0;
    const usedPenaltyB = usedActivityIds.has(b.id) ? -2.5 : 0;
    return scoreActivity(b, input) + usedPenaltyB - (scoreActivity(a, input) + usedPenaltyA);
  })[0];
};

const scheduleTime = (date: Date, hour: number, minute = 0) => setMinutes(setHours(startOfDay(date), hour), minute);

export const aiPlannerService = {
  async generate(input: AiTripInput): Promise<PlannedTrip> {
    const totalDays = differenceInCalendarDays(input.endDate, input.startDate) + 1;
    const dayAllocations = allocateDays(input.destinations, totalDays);
    const plannedStops: PlannedStop[] = [];
    const cityActivities = new Map<string, Activity[]>();

    let cursor = startOfDay(input.startDate);

    for (const [index, destination] of input.destinations.entries()) {
      const city = await ensureCity(destination, input.interests, index);
      const days = dayAllocations[index] ?? 1;
      const startDate = cursor;
      const endDate = addDays(cursor, days - 1);
      const activities = await ensureActivities(city, input.interests);

      cityActivities.set(city.id, activities);
      plannedStops.push({
        city,
        startDate,
        endDate,
        position: index,
        notes: `${days} day${days === 1 ? "" : "s"} tuned for ${input.travelStyle.toLowerCase().replace("_", " ")} travel.`
      });

      cursor = addDays(endDate, 1);
    }

    const dailyActivityTargetCents = Math.max(
      3500,
      Math.round((input.budgetCents * 0.24) / Math.max(totalDays, 1))
    );
    const items: PlannedItineraryItem[] = [];
    const usedActivityIds = new Set<string>();
    let estimatedActivityCostCents = 0;
    let globalDay = 1;

    for (const stop of plannedStops) {
      const activities = cityActivities.get(stop.city.id) ?? [];
      const stopDays = differenceInCalendarDays(stop.endDate, stop.startDate) + 1;

      for (let localDay = 0; localDay < stopDays; localDay += 1) {
        const date = addDays(stop.startDate, localDay);
        const isArrivalDay = localDay === 0 && stop.position > 0;
        const slotDefinitions: Array<{
          hour: number;
          minute?: number;
          duration: number;
          categories: ActivityCategory[];
          fallbackTitle: string;
          fallbackDescription: string;
        }> = [
          {
            hour: isArrivalDay ? 10 : 9,
            duration: isArrivalDay ? 75 : 105,
            categories: isArrivalDay ? ["TRANSIT", "LANDMARK"] : ["LANDMARK", "OUTDOORS", "CULTURE"],
            fallbackTitle: `${stop.city.name} arrival reset`,
            fallbackDescription: "Arrival buffer, luggage drop, transit check, and a calm orientation before the main plan starts."
          },
          {
            hour: 12,
            minute: 30,
            duration: 90,
            categories: ["FOOD"],
            fallbackTitle: `${stop.city.name} lunch anchor`,
            fallbackDescription: "A well-located meal stop chosen to protect the afternoon route from unnecessary backtracking."
          },
          {
            hour: 15,
            duration: 150,
            categories: input.interests.map(categoryFromInterest),
            fallbackTitle: `${stop.city.name} signature experience`,
            fallbackDescription: `A focused experience around ${input.interests.slice(0, 2).join(" and ")} with transit kept tight.`
          },
          {
            hour: 18,
            minute: 30,
            duration: 120,
            categories: ["FOOD", "NIGHTLIFE", "CULTURE", "WELLNESS"],
            fallbackTitle: `${stop.city.name} evening close`,
            fallbackDescription: "A polished end-of-day block near strong dinner, views, or low-key nightlife options."
          }
        ];

        slotDefinitions.forEach((slot, position) => {
          const activity = pickActivity(activities, input, slot.categories, usedActivityIds, dailyActivityTargetCents);
          const startTime = scheduleTime(date, slot.hour, slot.minute ?? 0);
          const duration = activity?.durationMinutes ?? slot.duration;
          const endTime = addMinutes(startTime, duration);
          const costCents = activity?.priceCents ?? 0;

          if (activity) {
            usedActivityIds.add(activity.id);
          }

          estimatedActivityCostCents += costCents;
          items.push({
            stopPosition: stop.position,
            activityId: activity?.id,
            title: activity?.title ?? slot.fallbackTitle,
            description: activity?.description ?? slot.fallbackDescription,
            category: activity?.category ?? slot.categories[0] ?? "EXPERIENCE",
            startTime,
            endTime,
            dayNumber: globalDay,
            position,
            costCents,
            metadata: {
              cityName: stop.city.name,
              localDate: format(date, "yyyy-MM-dd"),
              aiScore: activity ? Number(scoreActivity(activity, input).toFixed(2)) : 4.2,
              pacing: position === 0 ? "easy-start" : position === 3 ? "soft-close" : "focused"
            }
          });
        });

        globalDay += 1;
      }
    }

    const destinationNames = plannedStops.map((stop) => stop.city.name);
    const title = input.title ?? `${destinationNames.join(" + ")} Loop`;
    const summary = `A ${totalDays}-day ${input.travelStyle.toLowerCase().replace("_", " ")} itinerary across ${destinationNames.join(", ")} with ${input.interests.slice(0, 4).join(", ")} prioritized, costed day by day, and paced around fewer logistics gaps.`;

    return {
      title,
      summary,
      coverImageUrl: plannedStops[0]?.city.imageUrl ?? fallbackImage,
      stops: plannedStops,
      items,
      rationale: [
        "Daily structure alternates high-energy anchors with flexible meal and recovery windows.",
        "Activities are scored by stated interests, city catalog rating, travel style, and budget pressure.",
        "Multi-city stops preserve arrival buffers so the route feels realistic on the ground."
      ],
      estimatedActivityCostCents
    };
  }
};
