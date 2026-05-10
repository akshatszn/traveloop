"use client";

import Link from "next/link";
import { CalendarDays, Globe2, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { Trip } from "@/lib/types";

export function TripHero({
  trip,
  onPublish,
  publishPending = false
}: {
  trip: Trip;
  onPublish?: () => void;
  publishPending?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-lg border bg-white shadow-premium">
      <div className="relative min-h-[320px]">
        <img
          src={trip.coverImageUrl ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85"}
          alt={trip.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/30 to-transparent" />
        <div className="relative flex min-h-[320px] flex-col justify-end p-5 text-white md:p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/18 text-white backdrop-blur">
              {trip.travelStyle.toLowerCase().replace("_", " ")}
            </Badge>
            <Badge variant="secondary" className="bg-white/18 text-white backdrop-blur">
              {trip.visibility.toLowerCase()}
            </Badge>
          </div>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-normal md:text-6xl">{trip.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 md:text-base">{trip.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {onPublish ? (
                <Button variant="secondary" onClick={onPublish} disabled={publishPending}>
                  <Globe2 className="h-4 w-4" />
                  {trip.visibility === "PUBLIC" ? "Refresh share" : "Publish"}
                </Button>
              ) : null}
              <Button asChild variant="secondary">
                <Link href={`/share/${trip.shareSlug}`}>
                  <Share2 className="h-4 w-4" />
                  Share page
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-0 divide-y md:grid-cols-4 md:divide-x md:divide-y-0">
        {[
          [CalendarDays, "Dates", formatDateRange(trip.startDate, trip.endDate)],
          [Sparkles, "Items", `${trip.itineraryItems.length} planned`],
          [Globe2, "Stops", trip.stops.map((stop) => stop.city.name).join(" -> ")],
          [Share2, "Budget", formatCurrency(trip.budgetCents, trip.currency)]
        ].map(([Icon, label, value]) => {
          const IconComponent = Icon as typeof CalendarDays;
          return (
            <div key={String(label)} className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
                <IconComponent className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase text-muted-foreground">{String(label)}</div>
                <div className="truncate text-sm font-semibold">{String(value)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
