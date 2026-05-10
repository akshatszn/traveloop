"use client";

import { CheckCircle2, CircleDollarSign, Luggage, StickyNote } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Trip } from "@/lib/types";

export function BudgetPanel({ trip }: { trip: Trip }) {
  const planned = trip.budgets.reduce((sum, line) => sum + line.plannedCents, 0);
  const activityCost = trip.itineraryItems.reduce((sum, item) => sum + item.costCents, 0);
  const packed = trip.packingItems?.filter((item) => item.packed).length ?? 0;
  const packingTotal = trip.packingItems?.length ?? 0;

  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <CircleDollarSign className="h-4 w-4 text-ocean" />
            Budget
          </div>
          <Badge variant="accent">{formatCurrency(trip.budgetCents, trip.currency)}</Badge>
        </div>
        <div className="grid gap-3">
          {trip.budgets.map((line) => (
            <div key={line.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold capitalize">{line.category.toLowerCase()}</span>
                <span className="text-muted-foreground">{formatCurrency(line.plannedCents, line.currency)}</span>
              </div>
              <Progress value={(line.plannedCents / Math.max(planned, 1)) * 100} />
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md bg-secondary/70 p-3 text-sm">
          <div className="font-semibold">Scheduled activity estimate</div>
          <div className="mt-1 text-muted-foreground">{formatCurrency(activityCost, trip.currency)}</div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Luggage className="h-4 w-4 text-coral" />
            Packing
          </div>
          <Badge variant="secondary">
            {packed}/{packingTotal}
          </Badge>
        </div>
        <div className="grid gap-2">
          {trip.packingItems?.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-md bg-secondary/55 px-3 py-2 text-sm">
              <CheckCircle2 className={`h-4 w-4 ${item.packed ? "text-leaf" : "text-muted-foreground"}`} />
              <span className={item.packed ? "text-muted-foreground line-through" : ""}>{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 font-bold">
          <StickyNote className="h-4 w-4 text-ink" />
          Notes
        </div>
        <div className="grid gap-3">
          {trip.notes?.slice(0, 3).map((note) => (
            <div key={note.id} className="rounded-md border bg-white p-3">
              <div className="text-sm font-bold">{note.title}</div>
              <p className="mt-1 whitespace-pre-line text-sm leading-5 text-muted-foreground">{note.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
