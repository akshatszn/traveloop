import { differenceInCalendarDays, startOfDay } from "date-fns";
import { prisma } from "../lib/prisma.js";

export const dashboardService = {
  async getOverview(userId: string) {
    const trips = await prisma.trip.findMany({
      where: { ownerId: userId },
      include: {
        stops: { include: { city: true }, orderBy: { position: "asc" } },
        budgets: true,
        itineraryItems: true
      },
      orderBy: { updatedAt: "desc" }
    });

    const now = startOfDay(new Date());
    const activeTrips = trips.filter((trip) => trip.endDate >= now && trip.startDate <= now);
    const upcomingTrips = trips.filter((trip) => trip.startDate > now);
    const completedTrips = trips.filter((trip) => trip.endDate < now);
    const totalBudgetCents = trips.reduce((sum, trip) => sum + trip.budgetCents, 0);
    const plannedActivityCents = trips.reduce(
      (sum, trip) => sum + trip.itineraryItems.reduce((itemSum, item) => itemSum + item.costCents, 0),
      0
    );

    const budgetByCategory = Object.values(
      trips
        .flatMap((trip) => trip.budgets)
        .reduce<Record<string, { category: string; plannedCents: number; actualCents: number }>>((acc, budget) => {
          acc[budget.category] ??= { category: budget.category, plannedCents: 0, actualCents: 0 };
          const bucket = acc[budget.category]!;
          bucket.plannedCents += budget.plannedCents;
          bucket.actualCents += budget.actualCents;
          return acc;
        }, {})
    );

    const destinationMix = Object.values(
      trips
        .flatMap((trip) => trip.stops)
        .reduce<Record<string, { city: string; nights: number; imageUrl: string }>>((acc, stop) => {
          const key = `${stop.city.name}, ${stop.city.country}`;
          acc[key] ??= { city: key, nights: 0, imageUrl: stop.city.imageUrl };
          acc[key].nights += Math.max(1, differenceInCalendarDays(stop.endDate, stop.startDate));
          return acc;
        }, {})
    )
      .sort((a, b) => b.nights - a.nights)
      .slice(0, 6);

    return {
      metrics: {
        tripCount: trips.length,
        activeTripCount: activeTrips.length,
        upcomingTripCount: upcomingTrips.length,
        completedTripCount: completedTrips.length,
        totalBudgetCents,
        plannedActivityCents
      },
      recentTrips: trips.slice(0, 6),
      upcomingTrips: upcomingTrips.slice(0, 4),
      budgetByCategory,
      destinationMix
    };
  }
};
