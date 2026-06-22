# Architecture

TierMind is a Teamfight Tactics (TFT) stats analyzer. A **FastAPI** backend talks to
Riot's API and a **Supabase** (Postgres) database; a **React + TypeScript (Vite)**
frontend renders player dashboards and full match boards.

This document describes what every folder is for and the rules to follow when adding
code, so anyone joining (or forking) the project can find their way around fast.

---

## Repository layout

```
.
├── backend/        FastAPI service (Python)
├── frontend/       React + Vite app (TypeScript)
├── scripts/        one-off developer tooling
├── README.md       intro + setup
└── ARCHITECTURE.md you are here
```

---

## Backend — `backend/app`

Layered so each folder has a single responsibility. Dependencies point **downward**:
`api → services → repositories / clients → db / core`. Nothing lower reaches back up.

```
app/
├── main.py          App entry: builds the FastAPI app, CORS, includes routers.
├── config.py        Env-driven settings (pydantic-settings) loaded from .env.
│
├── api/
│   ├── deps.py      FastAPI dependencies (e.g. get_current_user for auth).
│   └── routes/      HTTP endpoints, one file per resource: auth, players, me, matches.
│
├── schemas/         Pydantic request/response models — the API's typed contract.
├── services/        Business logic: dashboard assembly, stats math. No HTTP, no SQL.
├── repositories/    Data access. The ONLY place that touches Supabase tables.
├── clients/         External API clients (riot.py wraps the Riot Games API).
├── core/            Cross-cutting concerns. security.py = password hashing + JWT.
├── db/              supabase.py — the single Supabase client instance.
└── tests/           pytest suite (see test_stats_service.py).
```

**Rules**

- **Routes stay thin.** A route parses the request (via a `schema`), calls a `service`,
  and returns. No business logic or SQL inside routes.
- **Only `repositories/` import the Supabase client.** Services and routes call
  repositories — they never import `db` directly.
- **Services are framework-free.** No FastAPI, no SQL in `services/`, so the logic is
  pure and unit-testable (`tests/test_stats_service.py` constructs inputs directly).
- **Shapes live in `schemas/`,** not inline in route files.

**Supabase tables:** `users` (accounts), `riot_accounts` (puuid cache),
`tft_matches` (raw match-JSON cache).

---

## Frontend — `frontend/src`

**Feature-based**: code is grouped by domain, not by file type. Adding a page usually
means adding (or extending) a folder under `features/`.

```
src/
├── main.tsx, App.tsx   Bootstrap + router.
│
├── features/
│   ├── auth/      Login/Signup pages, AuthContext, api.ts.
│   ├── player/    Search + Dashboard pages, PlayerProfile, charts,
│   │              MatchHistory, TopList, ProfileSkeleton, SearchBar, StatCard, api.ts.
│   └── matches/   MatchDetailPage, api.ts.
│
├── components/    Shared UI used by 2+ features (UnitBoard, TraitRow).
├── layout/        App chrome (Navbar).
├── lib/           Cross-cutting helpers:
│                    apiClient.ts   — BASE_URL (single source of truth)
│                    gameAssets.ts  — champion/item/trait icon + cost lookups
│                    gameAssets.generated.ts — AUTO-GENERATED, do not edit
├── types/         Shared domain types (tft.ts).
└── assets/        Static images.
```

**Rules**

- **Each feature owns** its pages, its feature-specific components, and its `api.ts`
  (the fetch calls for that domain).
- **Promotion rule:** a component used by 2+ features moves to `components/`; one used
  by a single feature stays in that feature.
- **Shared domain types live in `types/`.** Many (e.g. `MatchUnit`, `MatchTrait`) are
  used across features, so co-locating them in one feature would create awkward
  cross-feature imports.
- **Import across folders with the `@/` alias** (`@/` → `src/`), e.g.
  `import { BASE_URL } from '@/lib/apiClient'`. Absolute imports stay correct when files
  move. Same-folder imports may stay relative (`./StatCard`).
- **Never hand-edit `lib/gameAssets.generated.ts`** — regenerate it (see below).

---

## Conventions

- **Path alias:** `@/*` → `src/*`, configured in both `vite.config.ts` (bundler) and
  `tsconfig.app.json` (type-checker).
- **Commits:** Conventional Commits — `feat:`, `fix:`, `refactor:`, `chore:`, `test:`,
  `build:`.
- **Always green:** run `pytest` (backend) and `tsc --noEmit -p tsconfig.app.json`
  (frontend) before committing.

---

## Common tasks

**Add a backend endpoint**
1. Define request/response models in `schemas/`.
2. Add the route in `api/routes/<resource>.py` (thin — call a service).
3. Put logic in `services/`, data access in `repositories/`.
4. Register the router in `main.py` if the resource is new.

**Add a frontend feature**
1. Create `features/<name>/` with the page(s) and an `api.ts`.
2. Add a `<Route>` in `App.tsx` and a `NavLink` in `layout/Navbar.tsx`.
3. Reusable bits used elsewhere go in `components/`; shared types in `types/`.

**Regenerate game assets** (after a new TFT set ships)
```bash
python scripts/gen_champion_map.py
```
Pulls the latest champion/item/trait data from Riot's Data Dragon + Community Dragon and
rewrites `frontend/src/lib/gameAssets.generated.ts`.
