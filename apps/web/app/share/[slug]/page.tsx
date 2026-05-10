"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TripHero } from "@/components/itinerary/trip-hero";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { BudgetPanel } from "@/components/itinerary/budget-panel";

export default function PublicTripPage() {
  const params = useParams<{ slug: string }>();
  const tripQuery = useQuery({
    queryKey: ["public-trip", params.slug],
    queryFn: () => api.publicTrip(params.slug).then((response) => response.trip)
  });

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 lg:px-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
            <Compass className="h-4 w-4" />
          </span>
          Traveloop
        </Link>
        <Button asChild variant="outline">
          <Link href="/register">Create your loop</Link>
        </Button>
      </header>

      {tripQuery.isLoading ? (
        <div className="grid gap-5">
          <Skeleton className="h-[420px] rounded-lg" />
          <Skeleton className="h-[700px] rounded-lg" />
        </div>
      ) : tripQuery.isError || !tripQuery.data ? (
        <Card className="mx-auto mt-16 max-w-xl p-6 text-center">
          <h1 className="text-2xl font-bold">This itinerary is private</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ask the owner for a public Traveloop share link.</p>
        </Card>
      ) : (
        <div className="grid gap-5">
          <TripHero trip={tripQuery.data} />
          <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
            <ItineraryTimeline trip={tripQuery.data} readOnly />
            <aside className="xl:sticky xl:top-8 xl:h-fit">
              <BudgetPanel trip={tripQuery.data} />
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
