"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

type AuthStore = {
  token?: string;
  user?: User;
  hasHydrated: boolean;
  setSession: (session: { user: User; token: string }) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setSession: ({ user, token }) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: undefined, token: undefined }),
      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: "traveloop-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
);
