"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TripHero } from "@/components/itinerary/trip-hero";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { BudgetPanel } from "@/components/itinerary/budget-panel";

export default function TripPage() {
  const params = useParams<{ tripId: string }>();
  const queryClient = useQueryClient();
  const tripQuery = useQuery({
    queryKey: ["trip", params.tripId],
    queryFn: () => api.trip(params.tripId).then((response) => response.trip)
  });

  const publishMutation = useMutation({
    mutationFn: () => api.updateTrip(params.tripId, { visibility: "PUBLIC" }),
    onSuccess: ({ trip }) => {
      queryClient.setQueryData(["trip", params.tripId], trip);
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: string; dayNumber: number; position: number }>) =>
      api.reorderItinerary(params.tripId, items),
    onSuccess: ({ trip }) => {
      queryClient.setQueryData(["trip", params.tripId], trip);
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  if (tripQuery.isLoading) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-[420px] rounded-lg" />
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <Skeleton className="h-[720px] rounded-lg" />
          <Skeleton className="h-[520px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <Card className="mx-auto mt-16 max-w-xl p-6 text-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The itinerary may have been removed or belongs to another workspace.</p>
      </Card>
    );
  }

  const trip = tripQuery.data;

  return (
    <div className="grid gap-5 pb-24 lg:pb-8">
      <TripHero trip={trip} onPublish={() => publishMutation.mutate()} publishPending={publishMutation.isPending} />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <ItineraryTimeline trip={trip} onReorder={(items) => reorderMutation.mutate(items)} />
        <aside className="xl:sticky xl:top-8 xl:h-fit">
          <BudgetPanel trip={trip} />
        </aside>
      </div>
    </div>
  );
}
