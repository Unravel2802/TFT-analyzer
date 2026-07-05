# Changelog

Every working session gets one dated entry, newest first. Each bullet says **what** changed and **why it matters**, with the commit hash so you can `git show <hash>` for the full diff and explanation.

---

## 2026-07-05 — Comps card layout consistency

- **`fix(comps)`** — Comp cards silently flipped layout based on unit count: `.comp-card-body` was a flex row with `flex-wrap`, so wide boards (many units) pushed the stats block onto a second line (stats *below*) while narrow boards kept it inline (stats *right*). Pinned it to one horizontal layout — `.comp-units` now grows to fill the row (`flex: 1 1 auto; min-width: 0`) and wraps its portraits internally, and `.comp-stats` never shrinks (`flex: 0 0 auto`) — so the avg-place + Top4/Win block sits on the right for every card regardless of roster size. Verified with a headless-Chrome screenshot of `/comps` (6 cards, all aligned).

---

## 2026-07-04 — Frontend visualization overhaul + critical fixes

Full-codebase review, then a 10-step plan: fix the things that break the app in practice, build a shared chart foundation, and render the analytics the backend already computed but the UI never showed.

### Critical fixes

- **`fix(css)` `eb374ec`** — `var(radius-sm)` (missing `--`) in App.css didn't just no-op: the CSS minifier rejects it, so `npm run build` failed outright. One-character fix.
- **`refactor(api)` `b3b253b`** — `BASE_URL` was hardcoded to `localhost:8000`; now reads `VITE_API_URL` (inlined by Vite at build time) with a dev fallback. Added shared `request<T>()` helper in [apiClient.ts](frontend/src/lib/apiClient.ts) — all 10 feature `api.ts` files now go through it, so FastAPI error messages (like the 429 rate-limit hint) reach every page.
- **`fix(auth)` `bf9c01f`** — JWT lived only in React state, so a refresh logged you out. Now persisted in `localStorage` (lazy `useState` initializer = no logged-out flash), and any authenticated request that gets a 401 clears the session → `ProtectedRoute` redirects to `/login` on its own.
- **`chore(backend)` `b2cd9b8`** — `requirements.txt` was missing `supabase`/`python-jose`/`bcrypt` (fresh installs failed) and listed 4 unused packages; fixed and verified in a fresh venv (44 tests pass). Renamed `".env .example"` → `.env.example` with the required keys filled in. Deleted the duplicate `ClimbGoal` schema that silently shadowed the real one.

### Visualization foundation

- **`refactor` `7a3bc84`** — New [lib/placement.ts](frontend/src/lib/placement.ts) (win/top4/bot4 bucketing, previously copy-pasted in 6 files) and [lib/regions.ts](frontend/src/lib/regions.ts) (one canonical 12-region list replacing three divergent lists; all pages send the lowercase alias the backend normalizes).
- **`feat(charts)` `03b600b`** — Shared SVG chart kit at [components/charts/](frontend/src/components/charts/): `scale.ts` (the two affine maps: index→x, value→y, with `invertY` for lower-is-better), `LineChart` (crosshair + tooltip, gridlines, reference line, aria labels), `BarChart` (rounded data-ends, full-column hit targets, per-bar colors), `chartTheme.ts`.
- **`refactor(charts)` `61ac2b9`** — The three hand-rolled charts (placement trend, distribution, LP climb) became ~15-line wrappers around the kit. Pruned 15 dead CSS rules, each verified unused first.

### New visualizations (data the backend already served)

- **`feat(comps)` `8e37375`** — Comps table → ranked tier-list cards: core-unit boards with item icons, dimmed flex units, avg-place hero number, Top4/Win bar meters. Extracted the one `UnitPortrait` (was duplicated 3×; the UnitsPage copy had no 404 fallback).
- **`feat(sessions)` `2bede9e`** — Time-of-day bar chart (height = avg placement, color = verdict: best bucket green, worst red), streak badge, plain-language tilt callout. Also added the missing global `.muted` CSS rule (was scoped to one panel, so most uses were unstyled).
- **`feat(climb)` `670d97f`** — LP chart speaks rank: tooltips read "Gold II 50 LP" via [lib/rank.ts](frontend/src/lib/rank.ts) (inverse of backend `lp_utils.py`), axis ticks use short forms (G2/P4/M) on division boundaries.
- **`feat(tables)` `f51db01`** — Sort headers are real `<button>`s (keyboard-operable) with `aria-sort` and direction toggle; shimmer skeletons for Units/Leaderboard tables and Comps cards; fixed Units `top4_rate` missing its `%`.

### Verified by

`pytest` 44/44 · fresh-venv install · `npm run build` · headless-Chrome screenshots of `/comps`, `/units`, `/leaderboard` live + mock-data harnesses for auth-gated pages · rank math checked against the backend formula.

### Deferred (future sessions)

Backend: real Riot rate limiter, cache eviction in `services/cache.py`, unhandled 500 paths, route-level tests. Frontend: error boundary, React Query, dead navbar stub links, light theme.
