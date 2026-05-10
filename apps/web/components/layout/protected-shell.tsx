"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BarChart3, Compass, LogOut, Map, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, initials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/trips/new", label: "AI Builder", icon: Sparkles },
  { href: "/dashboard#recent", label: "Trips", icon: Map }
];

export function ProtectedShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, hasHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, router, token]);

  if (!hasHydrated || !token || !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-premium">
          <Skeleton className="mb-4 h-8 w-40" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-6 h-4 w-3/4" />
          <div className="grid gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-64 rounded-lg border bg-white/86 p-3 shadow-hairline backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold">Traveloop</div>
              <div className="text-xs text-muted-foreground">Plan together</div>
            </div>
          </Link>

          <nav className="mt-6 grid gap-1">
            {navigation.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                    active && "bg-ink text-white hover:bg-ink hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border bg-secondary/55 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-sm font-bold text-white">
                {initials(user.name)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{user.name}</div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b bg-white/82 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <Compass className="h-5 w-5" />
            Traveloop
          </Link>
          <Button asChild size="sm">
            <Link href="/trips/new">
              <Plus className="h-4 w-4" />
              New
            </Link>
          </Button>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="px-4 py-5 lg:ml-72 lg:px-8 lg:py-8"
      >
        {children}
      </motion.main>

      <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-3 rounded-lg border bg-white/90 p-1 shadow-premium backdrop-blur-xl lg:hidden">
        {navigation.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold text-muted-foreground",
                active && "bg-ink text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
