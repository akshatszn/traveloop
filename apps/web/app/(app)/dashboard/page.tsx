"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CircleDollarSign, Map, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TripCard } from "@/components/dashboard/trip-card";
import { BudgetChart } from "@/components/dashboard/budget-chart";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.dashboard().then((response) => response.dashboard)
  });

  if (dashboardQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Card className="mx-auto mt-16 max-w-xl p-6 text-center">
        <Badge variant="coral" className="mb-3">
          Connection issue
        </Badge>
        <h1 className="text-2xl font-bold">The API did not respond cleanly.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Start the backend and refresh this dashboard.</p>
      </Card>
    );
  }

  const dashboard = dashboardQuery.data;
  const hasTrips = dashboard.recentTrips.length > 0;

  return (
    <div className="grid gap-6 pb-24 lg:pb-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="accent" className="mb-3">
            Travel command center
          </Badge>
          <h1 className="text-3xl font-bold tracking-normal text-ink md:text-5xl">Your trips, budgets, and next moves.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            A high-density planning cockpit for generated routes, shared itineraries, budget health, and upcoming
            city stops.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/trips/new">
            <Plus className="h-4 w-4" />
            New AI trip
          </Link>
        </Button>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Trips planned"
          value={String(dashboard.metrics.tripCount)}
          helper={`${dashboard.metrics.upcomingTripCount} upcoming`}
          icon={Map}
        />
        <MetricCard
          label="Total budget"
          value={formatCurrency(dashboard.metrics.totalBudgetCents)}
          helper="Across all workspaces"
          icon={CircleDollarSign}
          tone="ocean"
        />
        <MetricCard
          label="Activity spend"
          value={formatCurrency(dashboard.metrics.plannedActivityCents)}
          helper="Generated itinerary items"
          icon={Sparkles}
          tone="coral"
        />
        <MetricCard
          label="Active now"
          value={String(dashboard.metrics.activeTripCount)}
          helper={`${dashboard.metrics.completedTripCount} completed`}
          icon={CalendarClock}
          tone="leaf"
        />
      </section>

      {!hasTrips ? (
        <Card className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-xl font-bold">Create your first Traveloop itinerary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The wizard will generate stops, timeline items, budgets, notes, and a packing list in one pass.
            </p>
          </div>
          <Button asChild>
            <Link href="/trips/new">Open AI Builder</Link>
          </Button>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div id="recent" className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Recent trips</h2>
            <Link href="/trips/new" className="text-sm font-semibold text-ocean">
              Generate route
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.recentTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <BudgetChart data={dashboard.budgetByCategory} />
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Destination mix</h2>
              <Badge variant="secondary">Nights</Badge>
            </div>
            <div className="grid gap-3">
              {dashboard.destinationMix.map((item) => (
                <div key={item.city} className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.city} className="h-10 w-10 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{item.city}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-coral"
                        style={{
                          width: `${Math.min(100, item.nights * 18)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-bold">{item.nights}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
