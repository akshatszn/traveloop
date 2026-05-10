import bcrypt from "bcryptjs";
import { ActivityCategory, TravelStyle, TripVisibility } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";
import { tripService } from "../src/services/trip.service.js";

const cities = [
  {
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85",
    description: "High-precision transit, layered neighborhoods, design hotels, ramen counters, galleries, and serene pockets of calm.",
    avgDailyCostCents: 26000,
    activities: [
      ["Tsukiji Outer Market breakfast route", "A focused morning food crawl through tamagoyaki, tuna counters, knife shops, and espresso within a tight walking radius.", "FOOD", ["food", "market", "coffee"], 5200, 120, "Tsukiji", 4.9, "morning"],
      ["Nezu Museum and Aoyama design walk", "A culture-forward block pairing modern galleries, architecture, and a calm garden reset before Omotesando.", "CULTURE", ["art", "architecture", "design"], 2400, 150, "Aoyama", 4.8, "afternoon"],
      ["Yanaka old Tokyo wander", "A low-pressure neighborhood route through temples, small shops, and side streets that still feel lived-in.", "LANDMARK", ["history", "walking", "local"], 0, 120, "Yanaka", 4.7, "morning"],
      ["Shimokitazawa vinyl and izakaya night", "A flexible evening plan for record stores, tiny bars, and dinner without fighting the busiest Shibuya corridors.", "NIGHTLIFE", ["music", "bars", "vintage"], 7800, 180, "Shimokitazawa", 4.75, "evening"],
      ["Kiyosumi garden and coffee circuit", "A relaxed route around a classic garden, roasters, and contemporary galleries across east Tokyo.", "WELLNESS", ["coffee", "garden", "slow"], 1800, 135, "Kiyosumi", 4.65, "morning"]
    ]
  },
  {
    name: "Kyoto",
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo",
    latitude: 35.0116,
    longitude: 135.7681,
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85",
    description: "Temple mornings, craft neighborhoods, riverside dining, and cultural depth best experienced with early starts.",
    avgDailyCostCents: 23000,
    activities: [
      ["Fushimi Inari early gate climb", "An early shrine route built to avoid crowd pressure while keeping enough time for tea afterward.", "LANDMARK", ["temple", "history", "walking"], 0, 150, "Fushimi", 4.9, "morning"],
      ["Nishiki Market chef picks", "A compact tasting route through Kyoto snacks, knives, pickles, and seasonal sweets.", "FOOD", ["food", "market", "craft"], 4600, 105, "Kawaramachi", 4.7, "midday"],
      ["Higashiyama ceramics studio", "A hands-on studio session with a local maker and time to browse surrounding craft shops.", "EXPERIENCE", ["craft", "ceramics", "design"], 8600, 150, "Higashiyama", 4.8, "afternoon"],
      ["Philosopher's Path garden walk", "A quiet, restorative walk connecting smaller temples, canals, and garden pockets.", "OUTDOORS", ["garden", "walking", "slow"], 1600, 135, "Sakyo", 4.65, "afternoon"],
      ["Pontocho dinner corridor", "A reservation-oriented evening near the river with a graceful end to the day.", "FOOD", ["dinner", "river", "reservation"], 9400, 120, "Pontocho", 4.72, "evening"]
    ]
  },
  {
    name: "Paris",
    country: "France",
    countryCode: "FR",
    timezone: "Europe/Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=85",
    description: "Museum density, polished streets, serious pastry, intimate wine bars, and unmatched walkability by arrondissement.",
    avgDailyCostCents: 31000,
    activities: [
      ["Left Bank pastry and bookshop route", "A morning route around precise pastries, independent bookshops, and small galleries near Saint-Germain.", "FOOD", ["pastry", "coffee", "books"], 3800, 120, "Saint-Germain", 4.82, "morning"],
      ["Louvre highlights with Richelieu focus", "A museum block focused on high-impact rooms and calmer wings rather than attempting the impossible full sweep.", "CULTURE", ["museum", "art", "history"], 2200, 150, "1st arrondissement", 4.86, "afternoon"],
      ["Canal Saint-Martin aperitif walk", "A golden-hour walk with design shops, wine stops, and dinner options nearby.", "NIGHTLIFE", ["wine", "design", "walking"], 6200, 150, "Canal Saint-Martin", 4.7, "evening"],
      ["Marché d'Aligre picnic build", "A market-first lunch plan with cheese, fruit, bread, and a park reset before the afternoon.", "FOOD", ["market", "picnic", "local"], 4200, 105, "Aligre", 4.74, "midday"],
      ["Palais-Royal and covered passages", "A polished architecture walk through gardens, arcades, and smaller shopping corridors.", "LANDMARK", ["architecture", "shopping", "history"], 0, 120, "Palais-Royal", 4.68, "afternoon"]
    ]
  },
  {
    name: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    timezone: "Europe/Madrid",
    latitude: 41.3874,
    longitude: 2.1686,
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=85",
    description: "Mediterranean rhythm, architecture, tapas, beach edges, and neighborhoods that reward unhurried exploration.",
    avgDailyCostCents: 24000,
    activities: [
      ["Sagrada Família timed-entry study", "A timed architecture block with enough context to appreciate the structure without losing half the day.", "CULTURE", ["architecture", "gaudi", "history"], 3400, 120, "Eixample", 4.88, "morning"],
      ["El Born tapas progression", "A walkable dinner crawl through polished bars, vermouth, seafood, and small plates.", "FOOD", ["tapas", "wine", "dinner"], 6500, 180, "El Born", 4.77, "evening"],
      ["Gràcia design shops and plazas", "A neighborhood afternoon with independent shops, shaded squares, and low-stress cafe stops.", "SHOPPING", ["design", "shopping", "local"], 2800, 135, "Gràcia", 4.64, "afternoon"],
      ["Montjuïc garden and viewpoint loop", "A scenic block connecting gardens, viewpoints, and soft transit back into the city.", "OUTDOORS", ["views", "garden", "walking"], 1200, 150, "Montjuïc", 4.7, "afternoon"],
      ["Barceloneta swim and seafood lunch", "A relaxed coast-side reset that keeps the beach, showers, and lunch logistics simple.", "WELLNESS", ["beach", "seafood", "slow"], 5200, 150, "Barceloneta", 4.58, "midday"]
    ]
  }
] as const;

const main = async () => {
  const passwordHash = await bcrypt.hash("Traveloop2026!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@traveloop.ai" },
    update: {
      name: "Maya Chen",
      passwordHash,
      avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Maya%20Chen"
    },
    create: {
      email: "demo@traveloop.ai",
      name: "Maya Chen",
      passwordHash,
      avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Maya%20Chen"
    }
  });

  await prisma.trip.deleteMany({ where: { ownerId: user.id } });

  for (const cityData of cities) {
    const city = await prisma.city.upsert({
      where: { name_country: { name: cityData.name, country: cityData.country } },
      update: {
        countryCode: cityData.countryCode,
        timezone: cityData.timezone,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
        imageUrl: cityData.imageUrl,
        description: cityData.description,
        avgDailyCostCents: cityData.avgDailyCostCents
      },
      create: {
        name: cityData.name,
        country: cityData.country,
        countryCode: cityData.countryCode,
        timezone: cityData.timezone,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
        imageUrl: cityData.imageUrl,
        description: cityData.description,
        avgDailyCostCents: cityData.avgDailyCostCents
      }
    });

    await prisma.activity.deleteMany({ where: { cityId: city.id } });
    await prisma.activity.createMany({
      data: cityData.activities.map(
        ([title, description, category, tags, priceCents, durationMinutes, neighborhood, rating, bestTimeOfDay]) => ({
          cityId: city.id,
          title,
          description,
          category: category as ActivityCategory,
          tags: [...tags],
          priceCents,
          durationMinutes,
          neighborhood,
          rating,
          bestTimeOfDay,
          imageUrl: cityData.imageUrl
        })
      )
    });
  }

  const trip = await tripService.createFromAi(user.id, {
    title: "Japan Design Loop",
    destinations: [
      { city: "Tokyo", country: "Japan", nights: 3 },
      { city: "Kyoto", country: "Japan", nights: 2 }
    ],
    startDate: new Date("2026-10-08T00:00:00.000Z"),
    endDate: new Date("2026-10-13T00:00:00.000Z"),
    budgetCents: 420000,
    currency: "USD",
    travelStyle: TravelStyle.CULTURE,
    interests: ["architecture", "food", "coffee", "craft", "gardens"]
  });

  await prisma.trip.update({
    where: { id: trip.id },
    data: {
      visibility: TripVisibility.PUBLIC,
      collaborators: [
        {
          email: "alex@example.com",
          name: "Alex Rivera",
          role: "editor",
          acceptedAt: new Date().toISOString()
        }
      ]
    }
  });

  console.log("Seeded Traveloop demo data");
  console.log("Demo login: demo@traveloop.ai / Traveloop2026!");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
