"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="max-w-lg p-6 text-center shadow-premium">
        <div className="text-sm font-bold uppercase text-coral">Something drifted</div>
        <h1 className="mt-2 text-2xl font-bold">Traveloop hit an interface error.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{error.message}</p>
        <Button className="mt-5" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </Card>
    </div>
  );
}
