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
- **Zod** for validating AI parser output, and food/plan editor form input, at
  the trust boundary — every mutation is re-validated server-side regardless
  of what the client sent
- **Claude API** (`@anthropic-ai/sdk`) for natural-language parsing, with a
  deterministic rule-based parser as the default/fallback (and what the test
  suite uses, so tests never need an API key). `ANTHROPIC_API_KEY` is read
  only in server-only modules (`src/lib/ai/claudeParser.ts`) and is never
  imported by a `"use client"` component, so it can't leak to the browser.
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

## The shake's permanent rule

Daniel's shake (`src/lib/adjustment/shakeRules.ts`) always has its own
explicit meal slot — `mealType: "shake"` — never conflated with a generic
snack (`afternoon_snack`/`other`). Saying "tomei meu shake" (no ingredients
listed) resolves to the active plan's *current* quantities for that slot
(today's already-adjusted amounts, if any) via `usesPlanDefault` on the
parsed message; a generic "comi um lanche" is a different slot entirely and
never marks the shake as consumed.

The adjustment engine may resize the shake's items but the six mandatory
components (whey, fruit, leite desnatado, aveia, castanhas, creatina) can
never be dropped or zeroed — `validateShakeComposition()` is both a
unit-tested business rule and a defense-in-depth check the engine runs on
its own output every time it adjusts a protected-composition meal.

## Quick Add

The dashboard's message box ("O que voce comeu ou fez hoje?") stays the
primary way to log anything — Quick Add is a second, structured entry point
into the exact same pipeline (`src/app/(app)/quick-add-actions.ts` calls the
same `recalculateDay`/nutrition engines `processUserMessage` does), for when
typing a sentence isn't the fastest option. Nine chips open small inline
forms: **Peso** (weight/time/condition/notes), **Refeicao** (pick a food from
the active catalog, quantity + unit, add several at once), **Passos**,
**Musculacao**, **Natacao**, **Outra atividade**, **Agua**, **Suplemento**
(whey/creatine, target grams pulled from the active plan — never hardcoded),
and **Check-in** (fome/energia/desempenho, 1-5 — opt-in data the alert engine
uses; skipping it just means those specific alerts never fire).

## Minha evolucao (`/progress`)

Period-filterable (7/14/30/60/90 days) rollup: initial vs current weight,
total change, 7-day rolling average, and a trend verdict (↓/→/↑) that's
never read off a single weigh-in — `calculateWeightTrend()`
(`src/lib/analysis/trend.ts`) compares this week's rolling average against
last week's and explicitly returns "Dados insuficientes para calcular
tendencia" rather than guessing when there isn't enough history. Below that:
average calories/macros vs the active plan's targets, activity averages
(steps, sessions by type), estimated energy-balance averages (always labeled
"estimado"), and the same weight/calories/macros/activity/deficit charts as
`/history`, scoped to the selected period.

## Alerts (`/alerts`)

Deterministic, non-diagnostic cautions computed by
`detectAlerts()` (`src/lib/analysis/alerts.ts`) from several days of data —
never a single bad day or one weigh-in. Types: `LOW_PROTEIN`,
`LOW_HYDRATION`, `LOW_INTAKE`, `HIGH_DEFICIT`, `RAPID_WEIGHT_LOSS`,
`LOW_ENERGY`, `HIGH_HUNGER`, `PERFORMANCE_DROP`, `HIGH_ACTIVITY`, each with a
severity (`INFO`/`NOTICE`/`WARNING` — no `CRITICAL`, this isn't a diagnostic
tool). None of them trigger an automatic change to the diet, activity, or
plan — several messages explicitly say so ("nao vamos recomendar jejum...",
"isso nao aumenta automaticamente sua meta..."), and that's enforced
structurally: the detection module has no write access to anything. At most
one row per `(userId, type)` ever exists (`syncAlertsForToday()` in
`src/lib/services/syncAlerts.ts`): a still-true condition gets its message
refreshed in place without resetting `isRead`; one that stops being true is
deleted, so the page only ever shows what's currently relevant. Synced on
every dashboard and `/alerts` load.

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
login; there's no in-app password-change flow yet).

To enable real Claude-based parsing instead of the rule-based fallback, set
`ANTHROPIC_API_KEY` in `.env`.

## Managing foods and plans

- **`/settings/foods`** — search/filter (active, inactive, or all) the food
  database, create a food, edit its nutrition facts, or deactivate one.
  Deactivating never hard-deletes: `active=false` just removes it from
  matching for *new* log entries (`processUserMessage` only matches active
  foods) while every historical `MealEntry` keeps its `foodId` and keeps
  displaying correctly. A food still referenced by an *active* plan's meal
  items can't be deactivated until it's removed from that plan.
- **`/settings/plans`** — view every plan ("Semana 1/2/3…"), edit its
  calorie/macro/water/supplement targets, add/edit/remove meals and their
  food items (target/min/max/step/role/mandatory), toggle which plan is
  active, or duplicate an existing plan into a new week (deep-copies every
  meal and item so only the deltas need editing). New plans start inactive;
  flip them on from the list once ready.

Both editors' server actions (`src/app/(app)/settings/foods/actions.ts`,
`.../settings/plans/actions.ts`) re-validate every submission with Zod and
scope every read/write to the authenticated user's own rows (via the
plan→user relation, since `PlanMeal`/`PlanMealItem` don't carry `userId`
directly) — never trusting client-side validation alone.

## Tests

```bash
npm test
```

148 tests. Unit tests cover the nutrition/activity/adjustment engines, the
shake composition rule, the rule-based parser, the food/plan form
validation, and the analysis engine (rolling averages, weight trend,
nutrition/activity/energy averages, alert detection — including that every
alert requires several days of corroborating data, never fires from a
single day, and that "denies doing X automatically" messages actually deny
it). Integration tests run against a dedicated SQLite file (`prisma/test.db`,
wiped between tests — never the dev database) and cover the end-to-end
logging pipeline, the shake slot fix (a snack never consumes the shake
slot; "tomei meu shake" resolves the plan's current composition), the
food/plan editors' CRUD paths, Quick Add's meal/activity/steps/check-in
writes, the alert sync/dedup/cleanup cycle, and cross-user ownership checks
(plan items, alerts).

## Project structure

```
prisma/schema.prisma        Data model (User, Profile, Food, NutritionPlan,
                             PlanMeal/PlanMealItem, MealEntry, PhysicalActivity,
                             DailyLog, WeightEntry, WaterEntry, SupplementEntry,
                             AdjustmentLog, Alert)
prisma/seed.ts               Daniel's profile + biometrics + food DB + "Semana 3" plan
src/lib/nutrition/           Deterministic nutrition math (grams -> macros/calories)
src/lib/activities/          Activity totals, TDEE, energy balance, double-counting guard
src/lib/adjustment/          Least-change engine + shake permanent-rule validation
src/lib/analysis/            Rolling averages, weight trend, nutrition/activity/energy
                              averages, alert detection (all pure, DB-free functions)
src/lib/ai/                  Natural language -> structured JSON (Claude + rule-based)
src/lib/services/            Orchestration: process a message, recalculate a day,
                              sync alerts, read models for dashboard/history/progress
src/lib/validation/          Zod schemas for AI output, food forms, plan forms
src/lib/auth.ts              Minimal single-user session auth
src/app/(app)/                Authenticated app shell: dashboard, history, progress,
                              alerts, plan, settings
src/app/(app)/quick-add-actions.ts  Structured entry points into the same engines
src/app/(app)/settings/foods  Food editor (list/search/create/edit/deactivate)
src/app/(app)/settings/plans  Plan editor (targets, meals, items, activate, duplicate)
src/components/dashboard/quickadd/  The nine Quick Add forms
tests/unit/                  Pure engine/validation/analysis tests (no DB)
tests/integration/           Full pipeline tests against a scratch SQLite DB
```

## Known limitations

- Single user (Daniel), though the schema (per-row `userId`, ownership
  checks in the settings/alerts actions) is multi-user-ready — there's just
  no sign-up/multi-account UI yet.
- No in-app password-change flow; rotate `SEED_USER_PASSWORD` and re-seed,
  or edit the `User` row's `passwordHash` directly.
- The rule-based parser covers the message patterns in the product spec
  (quantities in g/ml/units, common activity phrasing, weight/water, the
  shake by name). Freeform text outside those patterns needs
  `ANTHROPIC_API_KEY` set, or comes back with `needsClarification` instead
  of a guess.
- The plan editor lets you add/edit/remove meals and items, but there's no
  drag-to-reorder — set the `order` field directly when adding a meal.
- Alert thresholds (e.g. what counts as "elevated" deficit, "rapid" weight
  loss) are heuristic constants documented inline in
  `src/lib/analysis/alerts.ts`, not personalized or clinically derived —
  by design, since this app never diagnoses or prescribes.
- Quick Add's "Suplemento" form only covers whey/creatine (the two the plan
  tracks targets for); a free-form third supplement isn't wired up.
