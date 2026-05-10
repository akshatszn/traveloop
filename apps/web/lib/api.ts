import type { AiTripPayload, Dashboard, Trip, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type ApiErrorBody = {
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const getToken = () => {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem("traveloop-auth");
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed.state?.token;
  } catch {
    return undefined;
  }
};

async function request<T>(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(
      response.status,
      body.error?.code ?? "API_ERROR",
      body.error?.message ?? "Traveloop request failed",
      body.error?.details
    );
  }

  return (await response.json()) as T;
}

export const api = {
  register(input: { name: string; email: string; password: string }) {
    return request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  login(input: { email: string; password: string }) {
    return request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  me() {
    return request<{ user: User }>("/auth/me");
  },

  dashboard() {
    return request<{ dashboard: Dashboard }>("/dashboard");
  },

  trips() {
    return request<{ trips: Trip[] }>("/trips");
  },

  trip(tripId: string) {
    return request<{ trip: Trip }>(`/trips/${tripId}`);
  },

  createTrip(input: AiTripPayload) {
    return request<{ trip: Trip }>("/trips", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateTrip(tripId: string, input: Partial<Pick<Trip, "title" | "summary" | "visibility" | "coverImageUrl">>) {
    return request<{ trip: Trip }>(`/trips/${tripId}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },

  reorderItinerary(
    tripId: string,
    items: Array<{ id: string; dayNumber: number; position: number; startTime?: string; endTime?: string }>
  ) {
    return request<{ trip: Trip }>(`/trips/${tripId}/itinerary/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ items })
    });
  },

  publicTrip(slug: string) {
    return request<{ trip: Trip }>(`/public/trips/${slug}`);
  }
};
