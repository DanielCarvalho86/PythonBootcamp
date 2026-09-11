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
                             AdjustmentLog, Alert) — SQLite, dev + tests
prisma/schema.production.prisma  Same data model, PostgreSQL — production only.
                             See "Deploy de produção" below.
prisma/migrations/           Postgres migration history for schema.production.prisma
                             (schema.prisma/dev never uses migrations — db push only)
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

## Deploy de produção

Production runs on **Vercel** (Next.js host) + **Supabase Postgres** (persistent
database) + **PostgreSQL migrations via Prisma Migrate**. Local dev and the
test suite keep using SQLite exactly as described above — nothing in this
section changes that.

### Two schemas, one data model

`prisma/schema.prisma` (SQLite, dev/test) and `prisma/schema.production.prisma`
(PostgreSQL, production) declare the **exact same models, fields, relations,
indexes, unique constraints, cascade rules and defaults** — every line is
identical except each file's `datasource` block. This is deliberate: rather
than hand-maintaining a "Postgres translation" that could silently drift from
what the app actually reads/writes, the production schema is a mirror,
diffed byte-for-byte against the dev schema whenever it changes.

**Keeping the two schemas in sync** — whenever you add/change a model in
`prisma/schema.prisma`:

1. Apply the identical change to `prisma/schema.production.prisma` (every
   model line, `@@index`, `@@unique`, `onDelete` — everything below the
   `datasource` block must stay textually identical between the two files).
2. Verify: `diff <(tail -n +21 prisma/schema.prisma) <(tail -n +33 prisma/schema.production.prisma)`
   must print nothing. (Line 21/33 are where `model User {` starts in each
   file today — adjust if the header comments grow.)
3. Generate a new migration for the change (needs a reachable Postgres — the
   Supabase project itself, once it exists):
   `npx prisma migrate dev --schema=prisma/schema.production.prisma --create-only --name <change>`,
   review the generated SQL, then apply it with
   `npm run db:migrate:deploy:production` (see below).
4. Never hand-edit a file under `prisma/migrations/` after it has been
   applied anywhere — add a new migration instead.

`npm run db:validate:production` checks the production schema's syntax
offline (no DB connection needed) — run it after any edit.

### ⚠️ Do not run production Prisma commands from your local dev sandbox

`db:generate:production` writes into the same default `@prisma/client`
output as the SQLite schema. Only run `db:*:production` scripts from
Vercel's isolated build environment (see "Vercel configuration" below). If
you ever run one locally by accident, restore your dev client with
`npm run db:generate`.

### 1. Create the Supabase project (one-time, manual)

1. Go to **supabase.com** → sign in → **New project**.
2. Pick an organization, name it (e.g. `daniel-cutting-tracker`), choose a
   region close to you, and **set a strong database password** — save it in
   a password manager, you'll need it once to build the connection strings
   below. **Do not share this password in chat, in Git, or in any report.**
3. Wait for provisioning, then open **Project Settings → Database**.
4. Under **Connection string**, copy two values:
   - **Connection pooling** (Transaction mode, port `6543`) → this is your
     `DATABASE_URL`. It looks like
     `postgresql://postgres.xxxx:[PASSWORD]@aws-0-xxxx.pooler.supabase.com:6543/postgres?pgbouncer=true`.
   - **Direct connection** (port `5432`) → this is your `DIRECT_URL`. Same
     host style, port `5432`, no `pgbouncer` parameter.
5. Replace `[PASSWORD]` in both strings with the database password from step 2.

**Do not share these two connection strings with me in chat or anywhere
they'd be logged.** Paste them straight into Vercel's environment variable
UI (step 3 below) or into your own local `.env.production.local` (already
covered by `.gitignore`'s `.env*` rule) if you want to run a migration from
your own machine instead of asking me to.

### 2. Vercel project configuration (one-time, manual)

Since you already have Vercel connected to GitHub:

1. Open the Vercel dashboard → **Add New → Project** → import
   `DanielCarvalho86/PythonBootcamp`.
2. **Root Directory**: set to `daniel-cutting-tracker` (the repo root has
   unrelated bootcamp exercises alongside this app — Vercel must build from
   the subdirectory, not the repo root).
3. **Framework Preset**: Next.js (should auto-detect once Root Directory is set).
4. **Build Command**: override to
   `npm run build:production`
   (this runs `prisma generate` → `next build` against the production
   schema — see `package.json`). **Deliberately does not run any
   migration** — see "Applying migrations" below for why, and how.
5. **Install Command**: leave as `npm install` (default).
6. **Node.js Version**: 20.x or later (Project Settings → General).
7. **Production Branch**: `claude/daniel-cutting-tracker-7h53zp` (or `main`,
   once/if you merge this branch there — your call, not something to change
   without telling me first).

### 3. Environment variables (Vercel dashboard → Project Settings → Environment Variables)

Set these for the **Production** environment (names match exactly what the
code reads — nothing invented):

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase pooled connection string (port 6543) | from step 1 |
| `DIRECT_URL` | Supabase direct connection string (port 5432) | from step 1, used only by `prisma migrate deploy` (never by the build or the running app) |
| `AUTH_SESSION_SECRET` | a new random secret, e.g. `openssl rand -hex 32` | **do not reuse the dev value** |
| `AUTH_USER_EMAIL` | Daniel's real login email | |
| `ANTHROPIC_API_KEY` | your Claude API key | optional — omit to run on the rule-based parser only, exactly like dev without a key |

Nothing else is read from the environment by this app. Do not add
`AUTH_PASSWORD_HASH` — it appears in `.env.example` for historical reasons
but no code reads it; the real check is against the `User.passwordHash`
column (see `src/lib/auth.ts`).

### 4. Applying migrations (deliberately separate from the build)

`npm run build:production` only generates the Prisma Client and builds
Next.js — it **never** runs `prisma migrate deploy`. This is intentional:
Vercel runs the same Build Command for every deployment, including Preview
deployments for branches/PRs. If migrations ran inside the build, an
accidental Preview environment variable pointed at the production
`DATABASE_URL`/`DIRECT_URL` (or a future misconfiguration) could apply a
migration against production without anyone deciding to. Keeping migration
out of the build removes that path entirely — there is no automatic way
for any deploy, Preview or Production, to reach the database schema.

As a second layer, only ever set `DATABASE_URL`/`DIRECT_URL` in Vercel for
the **Production** environment scope (Project Settings → Environment
Variables → scope each variable to "Production" only, not "Preview" or
"Development") — Preview builds then have no database credentials to
connect with at all, even if something in the build process tried to.

Migrations are applied with a separate, explicit command:
`npm run db:migrate:deploy:production` — run this yourself (locally, with
production env vars loaded, or via Vercel's dashboard/CLI as a one-off
command against the Production environment) **before or after** a deploy,
never automatically as part of one. The first run applies the baseline
migration (`prisma/migrations/*_init/`) and creates every table — the
Supabase project starts empty, so this is a plain `CREATE TABLE` migration,
never a reset of anything. Subsequent runs are no-ops unless a new
migration file exists.

To create Daniel's actual production user (do **not** reuse the dev
password `cutting2026`):

- **Option A — from your own machine** (recommended, keeps the password
  off this chat entirely): pull the production env vars locally
  (`vercel env pull .env.production.local`), then run
  `SEED_USER_PASSWORD='<a-strong-password-you-choose>' AUTH_USER_EMAIL='<real-email>' DATABASE_URL='<pooled-url>' DIRECT_URL='<direct-url>' npm run db:seed:production`
  — this regenerates the Prisma client against the production schema and
  seeds the user, profile, food catalog and the active plan the same way
  `npm run db:seed` does locally. It's idempotent (safe to re-run: it
  upserts the user/profile/foods and only creates the plan if none exists
  yet, so it never duplicates or overwrites your real data on a second
  run). Afterwards, run `npm run db:generate` to restore your local dev
  client (see the warning above).
- **Option B — ask me to run it**: paste `SEED_USER_PASSWORD` (a password
  you choose, not the dev one) and confirm the production `DATABASE_URL`
  is already set in Vercel; I'll run the seed script against it using the
  same env vars, without ever printing the password back.

Either way, once seeded, log in with the production URL, your real email,
and the password you chose — never the dev default.

### 5. Verifying persistence (do this before calling the deploy done)

Log in on the production URL → log a test weight entry, a test meal, and
some water → log out → log back in → confirm all three are still there.
Prisma Migrate against a real Postgres database is durable by construction
(it's not SQLite-on-serverless-filesystem, which would NOT persist between
function invocations), but this check is still the actual proof, not an
assumption.

### Never do this against production

- `prisma migrate reset` (drops and recreates everything)
- `prisma db push` (can silently drop columns/tables to force-match the
  schema — migrations are the only production-safe path)
- Copying `prisma/dev.db` to the server, or pointing production at a
  file-based SQLite URL — Vercel's filesystem is ephemeral per invocation,
  so any writes would vanish and concurrent requests could see different
  data entirely.

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
