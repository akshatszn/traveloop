import Link from "next/link";
import { CalendarDays, MapPin, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { Trip } from "@/lib/types";

export function TripCard({ trip }: { trip: Trip }) {
  const cities = trip.stops?.map((stop) => stop.city.name).join(" -> ") || "Route in progress";

  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <Card className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-premium">
        <div className="relative h-36 overflow-hidden">
          <img
            src={trip.coverImageUrl ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85"}
            alt={trip.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
            <div className="min-w-0">
              <div className="truncate text-lg font-bold">{trip.title}</div>
              <div className="flex items-center gap-1 text-xs opacity-85">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{cities}</span>
              </div>
            </div>
            <Badge variant={trip.visibility === "PUBLIC" ? "accent" : "secondary"}>{trip.visibility.toLowerCase()}</Badge>
          </div>
        </div>
        <div className="grid gap-3 p-4">
          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{trip.summary}</p>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </div>
            <div className="flex items-center gap-1">
              <Route className="h-3.5 w-3.5" />
              {trip._count?.itineraryItems ?? trip.itineraryItems?.length ?? 0} items
            </div>
            <div className="text-right text-foreground">{formatCurrency(trip.budgetCents, trip.currency)}</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
