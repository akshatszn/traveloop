import { BudgetCategory, TravelStyle } from "@prisma/client";

const baseAllocations: Record<BudgetCategory, number> = {
  FLIGHTS: 0.16,
  LODGING: 0.28,
  FOOD: 0.17,
  ACTIVITIES: 0.18,
  TRANSIT: 0.08,
  SHOPPING: 0.04,
  BUFFER: 0.09
};

const styleAdjustments: Partial<Record<TravelStyle, Partial<Record<BudgetCategory, number>>>> = {
  LUXURY: { LODGING: 0.08, FOOD: 0.04, BUFFER: -0.04, TRANSIT: -0.02, SHOPPING: 0.02 },
  ADVENTURE: { ACTIVITIES: 0.07, LODGING: -0.04, SHOPPING: -0.02, TRANSIT: 0.02 },
  CULTURE: { ACTIVITIES: 0.04, FOOD: 0.03, SHOPPING: -0.02, BUFFER: -0.02 },
  RELAXED: { LODGING: 0.03, FOOD: 0.02, ACTIVITIES: -0.02, BUFFER: 0.01 },
  FAMILY: { LODGING: 0.03, TRANSIT: 0.02, BUFFER: 0.03, SHOPPING: -0.02 },
  REMOTE_WORK: { LODGING: 0.05, FOOD: 0.02, ACTIVITIES: -0.04, BUFFER: 0.02 }
};

const normalizeAllocations = (style: TravelStyle) => {
  const adjusted = { ...baseAllocations };
  const deltas = styleAdjustments[style] ?? {};

  for (const [category, delta] of Object.entries(deltas) as Array<[BudgetCategory, number]>) {
    adjusted[category] = Math.max(0.03, (adjusted[category] ?? 0) + delta);
  }

  const total = Object.values(adjusted).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(
    Object.entries(adjusted).map(([category, value]) => [category, value / total])
  ) as Record<BudgetCategory, number>;
};

export const budgetService = {
  estimate(budgetCents: number, currency: string, travelStyle: TravelStyle) {
    const allocations = normalizeAllocations(travelStyle);
    let assigned = 0;

    const lines = (Object.keys(allocations) as BudgetCategory[]).map((category, index, categories) => {
      const plannedCents =
        index === categories.length - 1
          ? budgetCents - assigned
          : Math.round(budgetCents * allocations[category]);

      assigned += plannedCents;

      return {
        category,
        plannedCents,
        actualCents: 0,
        currency,
        notes: category === "BUFFER" ? "Protected reserve for schedule changes and local surprises." : null
      };
    });

    return lines;
  }
};
