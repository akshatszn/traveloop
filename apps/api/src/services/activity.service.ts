import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export const activityService = {
  async search(input: { cityId?: string; q?: string; interests?: string }) {
    const interestTerms =
      input.interests
        ?.split(",")
        .map((term) => term.trim())
        .filter(Boolean) ?? [];

    const where: Prisma.ActivityWhereInput = {
      cityId: input.cityId,
      AND: [
        input.q
          ? {
              OR: [
                { title: { contains: input.q, mode: "insensitive" } },
                { description: { contains: input.q, mode: "insensitive" } },
                { neighborhood: { contains: input.q, mode: "insensitive" } }
              ]
            }
          : {},
        interestTerms.length > 0 ? { tags: { hasSome: interestTerms.map((term) => term.toLowerCase()) } } : {}
      ]
    };

    return prisma.activity.findMany({
      where,
      include: { city: true },
      orderBy: [{ rating: "desc" }, { priceCents: "asc" }],
      take: 36
    });
  },

  async cities() {
    return prisma.city.findMany({
      orderBy: [{ country: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { activities: true } }
      }
    });
  }
};
