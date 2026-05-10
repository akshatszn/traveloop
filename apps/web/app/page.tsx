"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, CalendarCheck, Compass, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && token) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, router, token]);

  return (
    <main className="min-h-screen px-4 py-5 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
              <Compass className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">Traveloop</span>
          </Link>
          <div className="space-y-5">
            <Badge variant="accent" className="w-fit">
              AI itinerary planning for teams and friends
            </Badge>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-normal text-ink md:text-7xl">
              Plan the trip before the group chat melts down.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Build costed, day-wise, multi-city itineraries with a collaborative workspace that feels calm,
              premium, and fast.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-3">
            {[
              ["8.4k", "routes scored"],
              ["18%", "budget saved"],
              ["4.9", "planner rating"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border bg-white/76 p-4 shadow-hairline backdrop-blur">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="overflow-hidden rounded-lg border bg-white shadow-premium"
        >
          <div className="relative h-72 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85"
              alt="City and coast travel planning"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="text-sm font-semibold opacity-80">Live itinerary</div>
              <div className="mt-1 text-3xl font-bold">Barcelona Design Weekend</div>
            </div>
          </div>
          <div className="grid gap-0 divide-y lg:grid-cols-[0.95fr_1.05fr] lg:divide-x lg:divide-y-0">
            <div className="space-y-4 p-5">
              {[
                [Sparkles, "AI wizard", "Interests, dates, budget, pacing"],
                [CalendarCheck, "Timeline", "Drag blocks across realistic days"],
                [Users, "Shared", "Public links and collaborator notes"]
              ].map(([Icon, title, copy]) => {
                const IconComponent = Icon as typeof Sparkles;
                return (
                  <div key={String(title)} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                      <IconComponent className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-bold">{String(title)}</div>
                      <div className="text-sm text-muted-foreground">{String(copy)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="timeline-grid p-5">
              {["9:00 Market breakfast", "12:30 Architecture walk", "15:00 Gallery block", "18:30 Tapas route"].map(
                (item, index) => (
                  <div
                    key={item}
                    className="mb-3 rounded-md border bg-white/88 p-3 shadow-sm"
                    style={{ marginLeft: `${index % 2 === 0 ? 0 : 18}px` }}
                  >
                    <div className="text-sm font-semibold">{item}</div>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-coral/70" />
                  </div>
                )
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
