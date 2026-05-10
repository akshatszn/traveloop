export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt?: string;
};

export type TravelStyle = "LUXURY" | "BALANCED" | "ADVENTURE" | "CULTURE" | "RELAXED" | "FAMILY" | "REMOTE_WORK";
export type TripVisibility = "PRIVATE" | "SHARED" | "PUBLIC";
export type ActivityCategory =
  | "FOOD"
  | "CULTURE"
  | "OUTDOORS"
  | "NIGHTLIFE"
  | "WELLNESS"
  | "SHOPPING"
  | "LANDMARK"
  | "EXPERIENCE"
  | "TRANSIT";

export type City = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  description: string;
  avgDailyCostCents: number;
};

export type Activity = {
  id: string;
  cityId: string;
  title: string;
  description: string;
  category: ActivityCategory;
  tags: string[];
  priceCents: number;
  durationMinutes: number;
  neighborhood: string;
  bookingUrl?: string | null;
  imageUrl: string;
  rating: number;
  bestTimeOfDay: string;
  city?: City;
};

export type TripStop = {
  id: string;
  tripId: string;
  cityId: string;
  startDate: string;
  endDate: string;
  position: number;
  notes?: string | null;
  city: City;
};

export type ItineraryItem = {
  id: string;
  tripId: string;
  stopId?: string | null;
  activityId?: string | null;
  title: string;
  description: string;
  category: ActivityCategory;
  startTime: string;
  endTime: string;
  dayNumber: number;
  position: number;
  costCents: number;
  bookingStatus: string;
  notes?: string | null;
  metadata: Record<string, unknown>;
  activity?: Activity | null;
  stop?: (TripStop & { city: City }) | null;
};

export type BudgetLine = {
  id: string;
  tripId: string;
  category: string;
  plannedCents: number;
  actualCents: number;
  currency: string;
  notes?: string | null;
};

export type PackingItem = {
  id: string;
  tripId: string;
  label: string;
  category: string;
  packed: boolean;
};

export type Note = {
  id: string;
  tripId: string;
  title: string;
  body: string;
  pinned: boolean;
  author?: Pick<User, "id" | "name" | "avatarUrl">;
};

export type Trip = {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
  budgetCents: number;
  currency: string;
  travelStyle: TravelStyle;
  status: "DRAFT" | "PLANNING" | "BOOKED" | "ACTIVE" | "COMPLETED";
  visibility: TripVisibility;
  coverImageUrl?: string | null;
  shareSlug: string;
  interests: string[];
  aiBrief: {
    rationale?: string[];
    estimatedActivityCostCents?: number;
    generatedAt?: string;
  };
  collaborators: Array<{ email: string; name: string; role: string; acceptedAt?: string }>;
  createdAt: string;
  updatedAt: string;
  stops: TripStop[];
  itineraryItems: ItineraryItem[];
  budgets: BudgetLine[];
  packingItems?: PackingItem[];
  notes?: Note[];
  _count?: {
    itineraryItems: number;
    notes: number;
    packingItems: number;
  };
};

export type Dashboard = {
  metrics: {
    tripCount: number;
    activeTripCount: number;
    upcomingTripCount: number;
    completedTripCount: number;
    totalBudgetCents: number;
    plannedActivityCents: number;
  };
  recentTrips: Trip[];
  upcomingTrips: Trip[];
  budgetByCategory: Array<{ category: string; plannedCents: number; actualCents: number }>;
  destinationMix: Array<{ city: string; nights: number; imageUrl: string }>;
};

export type AiTripPayload = {
  title?: string;
  destinations: Array<{ city: string; country?: string; nights?: number }>;
  startDate: string;
  endDate: string;
  budgetCents: number;
  currency: string;
  travelStyle: TravelStyle;
  interests: string[];
};
