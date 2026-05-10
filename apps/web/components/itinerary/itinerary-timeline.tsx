"use client";

import { useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, GripVertical, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ItineraryItem, Trip } from "@/lib/types";

const categoryTone: Record<string, string> = {
  FOOD: "bg-coral/12 text-coral",
  CULTURE: "bg-ocean/12 text-ocean",
  OUTDOORS: "bg-leaf/12 text-leaf",
  NIGHTLIFE: "bg-ink text-white",
  WELLNESS: "bg-emerald-100 text-emerald-700",
  SHOPPING: "bg-amber-100 text-amber-700",
  LANDMARK: "bg-slate-100 text-slate-700",
  EXPERIENCE: "bg-violet-100 text-violet-700",
  TRANSIT: "bg-zinc-100 text-zinc-700"
};

const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function SortableItineraryCard({ item, currency }: { item: ItineraryItem; currency: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "relative z-20 opacity-80" : ""}>
      <Card className="group overflow-hidden bg-white transition-all hover:shadow-premium">
        <div className="grid gap-0 md:grid-cols-[110px_1fr]">
          <div className="flex items-start justify-between border-b bg-secondary/45 p-4 md:block md:border-b-0 md:border-r">
            <div>
              <div className="text-sm font-bold">{timeFormatter.format(new Date(item.startTime))}</div>
              <div className="mt-1 text-xs text-muted-foreground">{timeFormatter.format(new Date(item.endTime))}</div>
            </div>
            <button
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-white hover:text-foreground md:mt-4"
              aria-label="Drag itinerary item"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold">{item.title}</h3>
                  <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${categoryTone[item.category]}`}>
                    {item.category.toLowerCase()}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {item.stop?.city.name ?? item.activity?.neighborhood ?? "Route"}
                </div>
              </div>
              <Badge variant="secondary">{formatCurrency(item.costCents, currency)}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
                <Clock className="h-3 w-3" />
                {Math.max(30, Math.round((new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 60000))}m
              </span>
              <span className="rounded-md bg-secondary px-2 py-1">{item.bookingStatus}</span>
              {typeof item.metadata.aiScore === "number" ? (
                <span className="rounded-md bg-secondary px-2 py-1">AI score {item.metadata.aiScore}</span>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DaySection({
  day,
  items,
  currency,
  onReorder
}: {
  day: number;
  items: ItineraryItem[];
  currency: string;
  onReorder: (items: Array<{ id: string; dayNumber: number; position: number }>) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
    const newIndex = sortedItems.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sortedItems, oldIndex, newIndex).map((item, index) => ({
      id: item.id,
      dayNumber: day,
      position: index
    }));
    onReorder(reordered);
  };

  return (
    <section id={`day-${day}`} className="scroll-mt-28">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase text-muted-foreground">Day {day}</div>
          <h2 className="text-xl font-bold">{sortedItems[0]?.stop?.city.name ?? "Itinerary"}</h2>
        </div>
        <Badge variant="secondary">{sortedItems.length} blocks</Badge>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="grid gap-3">
            {sortedItems.map((item) => (
              <SortableItineraryCard key={item.id} item={item} currency={currency} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

export function ItineraryTimeline({
  trip,
  onReorder,
  readOnly = false
}: {
  trip: Trip;
  onReorder?: (items: Array<{ id: string; dayNumber: number; position: number }>) => void;
  readOnly?: boolean;
}) {
  const grouped = useMemo(() => {
    return trip.itineraryItems.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
      const dayItems = acc[item.dayNumber] ?? [];
      dayItems.push(item);
      acc[item.dayNumber] = dayItems;
      return acc;
    }, {});
  }, [trip.itineraryItems]);

  const days = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="grid gap-5 lg:grid-cols-[120px_1fr]">
      <nav className="sticky top-20 z-20 flex gap-2 overflow-x-auto rounded-lg border bg-white/88 p-2 shadow-hairline backdrop-blur-xl lg:top-8 lg:block lg:h-fit lg:overflow-visible">
        {days.map((day) => (
          <a
            key={day}
            href={`#day-${day}`}
            className="block rounded-md px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Day {day}
          </a>
        ))}
      </nav>
      <div className="timeline-grid grid gap-8 rounded-lg border bg-white/52 p-3 md:p-5">
        {days.map((day) => (
          <DaySection
            key={day}
            day={day}
            items={grouped[day] ?? []}
            currency={trip.currency}
            onReorder={readOnly || !onReorder ? () => undefined : onReorder}
          />
        ))}
      </div>
    </div>
  );
}
