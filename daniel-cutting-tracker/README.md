# Daniel Cutting Tracker

Personal web app for tracking daily food intake, weight, physical activity, and
estimated energy balance during a cutting/recomposition phase. Users log meals
and activities in free-text natural language (in Portuguese), and the app
parses, calculates, persists, and — for food — automatically re-plans the rest
of the day's remaining meals to stay within the active nutrition plan.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Actions)
- **Tailwind CSS 4**
- **Prisma 6 + SQLite** for local dev/test (schema is provider-portable —
  switch `provider` to `postgresql` in `prisma/schema.prisma` and point
  `DATABASE_URL` at Supabase/Postgres for production; no application code
  depends on SQLite-specific features)
- **Zod** for validating AI parser output at the trust boundary
- **Claude API** (`@anthropic-ai/sdk`) for natural-language parsing, with a
  deterministic rule-based parser as the default/fallback (and what the test
  suite uses, so tests never need an API key)
- **Recharts** for history charts
- **Vitest** for unit + integration tests

## Design principle: the AI never does math

The LLM (or the rule-based fallback) only turns a sentence like *"Comi 200g de
frango, 150g de cuscuz e 10g de azeite"* into structured JSON — food names,
quantities, units. All nutrition math (grams → calories/macros), activity
totals, energy balance, and the "least change" meal-adjustment algorithm live
in deterministic, unit-tested TypeScript under `src/lib/nutrition`,
`src/lib/activities`, and `src/lib/adjustment`. See `src/lib/services/processMessage.ts`
for how the two sides connect.

## Getting started

```bash
npm install
cp .env.example .env          # fill in AUTH_SESSION_SECRET at minimum
npm run db:push               # creates prisma/dev.db from schema.prisma
npm run db:seed               # seeds Daniel's profile, food DB, and the "Semana 3" plan
npm run dev
```

The seed script prints the login email/password to use (defaults to
`cutting2026` unless `SEED_USER_PASSWORD` is set — change it after first
login; there's no in-app password-change flow yet in this MVP).

To enable real Claude-based parsing instead of the rule-based fallback, set
`ANTHROPIC_API_KEY` in `.env`.

## Tests

```bash
npm test
```

Runs unit tests for the nutrition/activity/adjustment engines and the
rule-based parser, plus integration tests against a dedicated SQLite file
(`prisma/test.db`, wiped between tests — never the dev database).

## Project structure

```
prisma/schema.prisma       Data model (User, Profile, Food, NutritionPlan,
                            PlanMeal/PlanMealItem, MealEntry, PhysicalActivity,
                            DailyLog, WeightEntry, WaterEntry, SupplementEntry,
                            AdjustmentLog)
prisma/seed.ts              Daniel's profile + biometrics + food DB + "Semana 3" plan
src/lib/nutrition/          Deterministic nutrition math (grams -> macros/calories)
src/lib/activities/         Activity totals, TDEE, energy balance, double-counting guard
src/lib/adjustment/         Least-change engine that resizes not-yet-eaten plan meals
src/lib/ai/                 Natural language -> structured JSON (Claude + rule-based)
src/lib/services/           Orchestration: process a message, recalculate a day, read models
src/lib/auth.ts             Minimal single-user session auth
src/app/(app)/               Authenticated app shell: dashboard, history, plan, settings
tests/unit/                 Pure engine tests (no DB)
tests/integration/          Full pipeline tests against a scratch SQLite DB
```

## Known MVP limitations

- Single user (Daniel), single active plan at a time — the schema supports
  more but there's no multi-user UI yet.
- No in-app UI to add/edit foods, plans, or change the login password;
  use `npx prisma studio` or edit `prisma/seed.ts` and re-run `npm run db:seed`.
- "Future meals" for the adjustment engine are determined by matching
  `mealType` against what's already logged that day. A freeform snack with
  no detected meal keyword defaults to `other`, which is also the shake's
  slot — logging such a snack before the shake will mark the shake as
  "already consumed" for adjustment purposes. Fine for the described usage
  pattern (meals are named — café, almoço, jantar — and the shake is
  mentioned explicitly), worth revisiting if that changes.
- The rule-based parser covers the message patterns in the product spec
  (quantities in g/ml/units, common activity phrasing, weight/water). Freeform
  text outside those patterns needs `ANTHROPIC_API_KEY` set, or comes back
  with `needsClarification` instead of a guess.
