"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Minus, Plus, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { TravelStyle } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useTripWizardStore } from "@/stores/trip-wizard-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const styles: Array<{ value: TravelStyle; label: string; copy: string }> = [
  { value: "BALANCED", label: "Balanced", copy: "Comfort, culture, and transit sanity" },
  { value: "CULTURE", label: "Culture", copy: "Museums, food, architecture, craft" },
  { value: "ADVENTURE", label: "Adventure", copy: "Outdoors and high-energy days" },
  { value: "LUXURY", label: "Luxury", copy: "Design hotels and premium dining" },
  { value: "RELAXED", label: "Relaxed", copy: "Slower mornings and soft landings" },
  { value: "FAMILY", label: "Family", copy: "Flexible pacing and easy logistics" },
  { value: "REMOTE_WORK", label: "Remote work", copy: "Work blocks and calmer evenings" }
];

const suggestedInterests = [
  "architecture",
  "food",
  "coffee",
  "craft",
  "gardens",
  "museums",
  "night markets",
  "beaches",
  "wellness",
  "design",
  "hiking",
  "wine"
];

export function TripWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const store = useTripWizardStore();
  const [customInterest, setCustomInterest] = useState("");

  const days = useMemo(() => {
    const start = new Date(store.startDate);
    const end = new Date(store.endDate);
    const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return Number.isFinite(diff) ? Math.max(1, diff) : 1;
  }, [store.endDate, store.startDate]);

  const completion = Math.round(
    ((store.title ? 1 : 0) +
      (store.destinations.filter((destination) => destination.city).length > 0 ? 1 : 0) +
      (store.startDate && store.endDate ? 1 : 0) +
      (store.budget > 0 ? 1 : 0) +
      (store.interests.length > 0 ? 1 : 0)) *
      20
  );

  const mutation = useMutation({
    mutationFn: api.createTrip,
    onSuccess: async ({ trip }) => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push(`/trips/${trip.id}`);
    }
  });

  const errorMessage = mutation.error instanceof ApiError ? mutation.error.message : undefined;

  const updateDestination = (index: number, field: "city" | "country" | "nights", value: string | number) => {
    const destinations = store.destinations.map((destination, currentIndex) =>
      currentIndex === index ? { ...destination, [field]: value } : destination
    );
    store.setField("destinations", destinations);
  };

  const addInterest = (interest: string) => {
    const normalized = interest.trim().toLowerCase();
    if (!normalized || store.interests.includes(normalized)) return;
    store.setField("interests", [...store.interests, normalized]);
  };

  const removeInterest = (interest: string) => {
    store.setField(
      "interests",
      store.interests.filter((item) => item !== interest)
    );
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.72fr_0.28fr]">
      <Card className="overflow-hidden bg-white/88 shadow-premium backdrop-blur-xl">
        <div className="border-b p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <Badge variant="accent" className="mb-3">
                AI trip creation wizard
              </Badge>
              <h1 className="text-3xl font-bold tracking-normal text-ink">Generate a complete itinerary.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Destinations, dates, budget, style, and interests become stops, day cards, costs, notes, and packing
                items.
              </p>
            </div>
            <div className="min-w-40">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Brief strength</span>
                <span>{completion}%</span>
              </div>
              <Progress value={completion} />
            </div>
          </div>
        </div>

        <form
          className="grid gap-6 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate({
              title: store.title,
              destinations: store.destinations
                .filter((destination) => destination.city.trim())
                .map((destination) => ({
                  city: destination.city.trim(),
                  country: destination.country.trim() || undefined,
                  nights: destination.nights
                })),
              startDate: store.startDate,
              endDate: store.endDate,
              budgetCents: Math.round(store.budget * 100),
              currency: "USD",
              travelStyle: store.travelStyle,
              interests: store.interests
            });
          }}
        >
          <section className="grid gap-4 md:grid-cols-2">
            <Field label="Trip title">
              <Input value={store.title} onChange={(event) => store.setField("title", event.target.value)} />
            </Field>
            <Field label="Travel style">
              <Select
                value={store.travelStyle}
                onChange={(event) => store.setField("travelStyle", event.target.value as TravelStyle)}
              >
                {styles.map((style) => (
                  <option value={style.value} key={style.value}>
                    {style.label}
                  </option>
                ))}
              </Select>
            </Field>
          </section>

          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold">Route</h2>
                <p className="text-sm text-muted-foreground">Multi-city planning with optional night weighting.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  store.setField("destinations", [...store.destinations, { city: "", country: "", nights: 1 }])
                }
              >
                <Plus className="h-4 w-4" />
                Stop
              </Button>
            </div>
            <div className="grid gap-3">
              {store.destinations.map((destination, index) => (
                <div key={index} className="grid gap-3 rounded-lg border bg-secondary/35 p-3 md:grid-cols-[1fr_1fr_110px_40px]">
                  <Field label={`City ${index + 1}`}>
                    <Input value={destination.city} onChange={(event) => updateDestination(index, "city", event.target.value)} />
                  </Field>
                  <Field label="Country">
                    <Input
                      value={destination.country}
                      onChange={(event) => updateDestination(index, "country", event.target.value)}
                    />
                  </Field>
                  <Field label="Nights">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={destination.nights}
                      onChange={(event) => updateDestination(index, "nights", Number(event.target.value))}
                    />
                  </Field>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={store.destinations.length === 1}
                      onClick={() =>
                        store.setField(
                          "destinations",
                          store.destinations.filter((_, currentIndex) => currentIndex !== index)
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Field label="Start date">
              <Input type="date" value={store.startDate} onChange={(event) => store.setField("startDate", event.target.value)} />
            </Field>
            <Field label="End date" hint={`${days} days`}>
              <Input type="date" value={store.endDate} onChange={(event) => store.setField("endDate", event.target.value)} />
            </Field>
            <Field label="Budget" hint={formatCurrency(store.budget * 100)}>
              <Input
                type="number"
                min={50}
                step={50}
                value={store.budget}
                onChange={(event) => store.setField("budget", Number(event.target.value))}
              />
            </Field>
          </section>

          <section className="grid gap-3">
            <div>
              <h2 className="font-bold">Interests</h2>
              <p className="text-sm text-muted-foreground">These drive activity scoring, category mix, and pacing.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedInterests.map((interest) => {
                const active = store.interests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => (active ? removeInterest(interest) : addInterest(interest))}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                      active ? "border-ink bg-ink text-white" : "bg-white hover:bg-secondary"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={customInterest}
                onChange={(event) => setCustomInterest(event.target.value)}
                placeholder="Add a custom interest"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addInterest(customInterest);
                  setCustomInterest("");
                }}
              >
                Add
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col-reverse justify-between gap-3 border-t pt-5 sm:flex-row sm:items-center">
            <Button type="button" variant="ghost" onClick={store.reset}>
              Reset brief
            </Button>
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate itinerary
              {!mutation.isPending ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          </div>
        </form>
      </Card>

      <aside className="grid content-start gap-4">
        <Card className="p-5">
          <h2 className="font-bold">Planner model</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {[
              ["Interest matching", "Scores title, tags, category, and route variety."],
              ["Budget pressure", "Keeps daily activity costs inside the requested envelope."],
              ["Pacing", "Adds arrival buffers and realistic meal anchors."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-md bg-secondary/60 p-3">
                <div className="font-semibold">{title}</div>
                <div className="mt-1 text-muted-foreground">{copy}</div>
              </div>
            ))}
          </div>
        </Card>

        <AnimatePresence>
          {mutation.isPending ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-lg border bg-ink p-5 text-white shadow-premium"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-coral" />
                <div className="font-bold">Building your loop</div>
              </div>
              <div className="mt-4 space-y-3">
                {["Scoring activities", "Optimizing daily rhythm", "Estimating category budget"].map((step, index) => (
                  <div key={step}>
                    <div className="mb-1 text-xs font-semibold text-white/70">{step}</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                      <motion.div
                        className="h-full origin-left rounded-full bg-coral"
                        animate={{ scaleX: [0.25, 0.95, 0.6] }}
                        transition={{ duration: 1.2, delay: index * 0.14, repeat: Infinity }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </aside>
    </div>
  );
}
