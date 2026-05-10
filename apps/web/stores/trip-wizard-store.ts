"use client";

import { create } from "zustand";
import type { TravelStyle } from "@/lib/types";

type WizardDestination = {
  city: string;
  country: string;
  nights: number;
};

type TripWizardStore = {
  title: string;
  destinations: WizardDestination[];
  startDate: string;
  endDate: string;
  budget: number;
  travelStyle: TravelStyle;
  interests: string[];
  setField: <K extends keyof Omit<TripWizardStore, "setField" | "reset">>(key: K, value: TripWizardStore[K]) => void;
  reset: () => void;
};

const initialState = {
  title: "Design-forward city loop",
  destinations: [
    { city: "Tokyo", country: "Japan", nights: 3 },
    { city: "Kyoto", country: "Japan", nights: 2 }
  ],
  startDate: "2026-10-08",
  endDate: "2026-10-13",
  budget: 4200,
  travelStyle: "CULTURE" as TravelStyle,
  interests: ["architecture", "food", "coffee", "craft", "gardens"]
};

export const useTripWizardStore = create<TripWizardStore>((set) => ({
  ...initialState,
  setField: (key, value) => set({ [key]: value } as Partial<TripWizardStore>),
  reset: () => set(initialState)
}));
