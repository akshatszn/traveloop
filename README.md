# Traveloop

Traveloop is an AI-assisted collaborative travel itinerary planner built as a production-grade monorepo:

- `apps/web`: Next.js 15 App Router, TypeScript, TailwindCSS, shadcn-style components, Framer Motion, Zustand, React Query
- `apps/api`: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT auth
- `docker-compose.yml`: local PostgreSQL for development

## Features

- JWT authentication with bcrypt password hashing
- Protected dashboard with recent trips, analytics, destination mix, and budget charts
- AI-assisted trip creation wizard for destinations, dates, budget, travel style, and interests
- Multi-city itinerary generation with day-wise schedules, suggested activities, and estimated costs
- Drag-and-drop itinerary timeline
- Budget estimation, packing items, notes, and public share pages
- Responsive premium UI with skeletons, loading states, sticky timeline navigation, and error boundaries

## Database

Required tables are defined in `apps/api/prisma/schema.prisma`:

- `users`
- `trips`
- `trip_stops`
- `cities`
- `activities`
- `itinerary_items`
- `budgets`
- `packing_items`
- `notes`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Configure environment:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

Set `JWT_SECRET` in `apps/api/.env` to a long random value.

4. Generate Prisma Client, migrate, and seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Run the product:

```bash
npm run dev
```

Web: `http://localhost:3000`

API: `http://localhost:4000`

Demo login after seeding:

```text
demo@traveloop.ai
Traveloop2026!
```

## Useful Scripts

```bash
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
```

## API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:tripId`
- `PATCH /api/trips/:tripId`
- `DELETE /api/trips/:tripId`
- `POST /api/trips/:tripId/itinerary`
- `PATCH /api/trips/:tripId/itinerary/reorder`
- `POST /api/ai/generate-itinerary`
- `GET /api/activities`
- `GET /api/activities/cities`
- `GET /api/public/trips/:slug`

## Verification

The current codebase has been checked with:

```bash
npm run typecheck
npm run build --workspace @traveloop/api
npm run build --workspace @traveloop/web
```
