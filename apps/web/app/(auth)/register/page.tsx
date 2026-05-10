"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Compass, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const mutation = useMutation({
    mutationFn: api.register,
    onSuccess: (session) => {
      setSession(session);
      router.replace("/trips/new");
    }
  });

  const errorMessage = mutation.error instanceof ApiError ? mutation.error.message : undefined;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <Card className="w-full max-w-md bg-white/88 shadow-premium backdrop-blur-xl">
        <CardHeader>
          <Link href="/" className="mb-3 flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white">
              <Compass className="h-4 w-4" />
            </span>
            Traveloop
          </Link>
          <CardTitle className="text-2xl">Create your travel workspace</CardTitle>
          <CardDescription>Secure JWT auth, protected routes, and collaborative itinerary planning.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate(form);
            }}
          >
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                autoComplete="name"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
              />
            </Field>
            <Field label="Password" hint="10+ chars, mixed case, number">
              <Input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                autoComplete="new-password"
              />
            </Field>
            {errorMessage ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Start planning
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have a workspace?{" "}
              <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
