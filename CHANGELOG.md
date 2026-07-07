# Changelog

Every working session gets one dated entry, newest first. Each bullet says **what** changed and **why it matters**, with the commit hash so you can `git show <hash>` for the full diff and explanation.

---

## 2026-07-07 — Cross-page personalization: all seven roadmap "feature upgrades"

Shipped the roadmap's entire "Feature upgrades to existing pages" section in one pass — the theme is wiring the pages together so personal data shows up wherever a player is already looking, mostly by re-running existing `compute_*` functions over the signed-in user's own matches instead of the global sample.

- **`feat(units)` — "Your avg" column vs the meta.** New `GET /me/units` runs `compute_unit_stats()` over your own match history (full list, not Coach's top-3); the Units page joins it to the global table by `unit_id` and adds a signed-in-only column, tinted green/red where you beat/trail the meta average (±0.15 dead zone), with your game count alongside. Signed-out visitors see the exact same table as before.
- **`feat(comps)` — "You've played this" badges.** New `GET /me/comps` runs `compute_comp_stats()` on your matches; since comp `name` is built identically on both sides, the page badges any global comp you've piloted: "You've played this 6× · your avg 3.8".
- **`feat(coach)` — you vs. the meta on unit rows.** `build_coach()` now joins each of your unit rows against the cached ladder-wide units table (`meta_avg` on `CoachStat`, `None` for traits/items); the UI stacks a small "META 3.71" under your own avg, so a "leak" can be read as *your* weak spot vs. a unit that's just weak for everyone. The units-meta cache moved into `get_units_meta_cached()` so the `/meta/units` route and Coach share one 5-min TTL entry; join failure degrades to no meta column, never a dead Coach page.
- **`feat(journal)` — tags + "what your tags say" report.** ⚠️ **Requires a one-line Supabase migration (`backend/migrations/001_match_notes_tags.sql`) before the Journal works again** — the code now selects the `tags` column. Notes take chips from a fixed 8-tag vocabulary (fixed so aggregation is possible at all); a new `GET /me/journal/report` joins each tagged note to your placement in that match (pulled from the cached match docs, since `match_notes` never stored placement) and reports avg placement per tag vs your overall — "games tagged *misplayed econ*: 5.4 vs your 4.2". Tag picker appears in both the match-detail note editor and journal-card editing; search also matches tags.
- **`feat(leaderboard)` — pinned "You" row.** New `GET /me/rank` (one targeted `get_rank()` call — anyone below apex is never in the top-25 payload). Viewing your own region signed-in: your row is highlighted in place if you're top-25, otherwise a pinned row under the header shows tier/LP and "N LP off the board" (distance to the lowest LP on display). Kept out of the public leaderboard endpoint on purpose: its response is TTL-cached *shared*, so per-user data there would poison the cache.
- **`feat(climb)` — pace projection drawn on the chart.** `LineChart` grew a `projectionValues` prop (second dashed series, null-padded to share the x axis); ClimbPage computes a forecast ray client-side from `journey.lp_per_day` — one point per day from the last snapshot to the goal, capped at 14 days so a slow pace can't dwarf history. Tooltip on projected points reads "in ~Nd at current pace".
- **`feat(dashboard)` — focus strip.** Three chips above the profile, one live fact from each differentiator page (fired in parallel, each failure-tolerant): current 2+ streak → Sessions, climb ETA/pace → Climb, single biggest leak (same min/max rule as Coach's takeaway) → Coach. Hidden while scouting another player.

### Verified by

`pytest` 59/59 (5 new tag-report tests) · `tsc` + `vite build` · headless-Chrome screenshots of all seven pages via a temporary fetch-stubbing harness (deleted after) plus the live signed-out Units/meta endpoints against the real backend. **Not verifiable live:** the Riot API key in `backend/.env` is currently expired (even public leaderboard 401s) — renew at developer.riotgames.com to exercise the `/me/*` endpoints end-to-end.

## 2026-07-05 — Climb goal journeys + reset, coach items/playstyle, dashboard form

Deepened the three player-facing pages. First session to add new backend surface since the analytics endpoints: one new route, no schema migrations (journey time is derived from data already stored).

- **`feat(climb)` — goal journey tracking.** When a goal is set, the page now tracks the chase itself: day count since the goal was set, LP gained since then, LP/day pace (only quoted after a full day, so one lucky game can't extrapolate into hundreds of LP/day), and a rough ETA at current pace. No new columns: the goal row's `updated_at` is the journey start (now written explicitly on upsert — a column default only fires on INSERT, not on an upsert's conflict-UPDATE), and the rank at that moment is recovered as the last `rank_snapshots` row captured at or before it. The progress bar now also measures from where you were when you set the goal, not your first-ever snapshot.
- **`feat(climb)` — reset goal.** New `DELETE /me/climb/goal` + a two-click "Reset goal → Confirm reset" button. Reset works even while the 7-day goal lock is active (deliberate two-step escape hatch); the lock itself is now actually surfaced in the UI — the change-goal button disables with a note saying when it unlocks, instead of letting you submit into a mystery 409.
- **`feat(coach)` — item insights + playstyle.** Best/worst **items** cards alongside traits/units (per-board deduped, junk ids like `EmptyBag`/set-mechanic anomaly items filtered, `TFT_Item_GuinsoosRageblade` → "Guinsoos Rageblade"), and a "How your games end" strip: avg end level, avg exit stage (round number converted to the in-game "5-3" label), avg damage dealt, avg gold left — reads like an econ/tempo fingerprint.
- **`feat(dashboard)` — recent form + streak.** Hero now shows a "Last 5 Avg" card coloured green/red when it deviates ≥0.3 from the 20-game average (lower is better), a 🔥/🧊 streak chip (consecutive top-4s or bottom-4s, shown from 2+), and "last played Xh ago" — all derived client-side from the matches array.

### Verified by

`pytest` 54/54 (5 new journey tests, 6 new coach tests) · `npm run build` + `tsc` · headless-Chrome screenshots of all three pages via temporary fetch-stubbing harnesses (deleted after) · route table checked for `DELETE /me/climb/goal`.

## 2026-07-05 — Insight-page features (building on the polish pass)

Added real, data-backed features to the same pages — all computed client-side from data the backend already returns, no new endpoints or faked data.

- **`feat(coach)`** — A "key takeaway" banner names the single strongest pick to lean into and the biggest leak to plug (min/max avg across both traits and units). Rows now show the actual avg placement next to the vs-average delta, and rows with < 5 games are dimmed + tooltipped as a small sample so a lucky 3-game streak isn't read as a verdict.
- **`feat(climb)`** — A quick-stat strip under the hero (net LP over the tracked window, peak rank, ranked-games count) plus a "Recent changes" panel listing the last few rank snapshots with per-game LP deltas (+/− coloured) — all derived from the existing `snapshots` array.
- **`feat(journal)`** — Turned the static list into a tool: a search box (filters by note text), a newest/oldest sort, and inline editing of any note (reuses the existing `saveNote` PUT) with save/cancel.
- **`feat(sessions)`** — Best/worst time-of-day chips now carry their game counts for at-a-glance sample size.

## 2026-07-05 — UI/UX polish: signed-in insight pages

Redesigned the five signed-in pages (coach, climb, journal, sessions, dashboard) so they read as one system instead of barebones content dumped under a loud title. Verified each with headless-Chrome screenshots against a throwaway `fetch`-stubbing preview harness (deleted after).

- **`feat(ui)` — shared page header.** New [PageHeader](frontend/src/components/PageHeader.tsx) + a `.page-doc` layout variant. The four insight pages led with a centered 48px glowing uppercase `.page-title` (a splash-screen look the polished dashboard never used) while `.page { align-items:center }` marooned their short content in a narrow island. `.page-doc` stops the centering and fills the width; PageHeader is a quiet left-aligned title + subtitle with an optional right-side summary-stat cluster.
- **`feat(coach)`** — Best/worst cards now have green/red accent dots, ranked rows, and a CSS-grid layout that fixes the old name/value collision ("Ambusher5.5"). Each row shows a "vs your overall avg" delta chip (e.g. `−1.5` green) — the actual coaching signal, not just a raw average.
- **`feat(climb)`** — Added a current-rank → goal-rank hero with tier emblems (reusing the medal art + `[data-tier]` colour map), a full-width labelled progress bar with "LP to go", and moved the chart and goal form into titled `.panel`s.
- **`feat(journal)`** — Notes are now quote-style cards that surface the previously-unused `updated_at` date and a match link; empty state is a real dashed panel instead of floating text.
- **`feat(sessions)`** — Balanced the two cards: a big streak number, the tilt insight as an icon callout box, and best/worst time-of-day chips under the bar chart.
- **`style(dashboard)`** — One scoped fix: the "Recent Matches" panel had a hollow band because the stat tiles were pinned to the bottom; grouped the bubble grid + tiles so they float down together and the breathing room lands under the title.
- **`chore(css)`** — Pruned the now-dead `.coach-grid/.coach-card/.streak-*/.climb-progress/.journal-item` rules the redesign replaced (CSS bundle shrank ~1 kB).

## 2026-07-05 — Frontend consistency pass (all pages)

Audited every page (screenshots of public pages + source review of auth-gated ones); fixing the uneven bits in reviewable steps.

- **`feat(leaderboard)`** — Three fixes to a page you could look at but not act on: (1) player names now link to a new public, param-driven `/player?region&name&tag` route that reuses SearchPage — auth-independent and shareable, so it works for logged-in users too (the `/` route redirects them to `/dashboard`); (2) the tier column, which shouted "CHALLENGER" on all 25 rows, is now a compact colour-coded badge (reuses the existing `--tier-color` map, generalized from `.identity-card[data-tier]` to `[data-tier]`); (3) the LP/Wins/Losses headers are click-to-sort with `aria-sort`, matching the Units table.
- **`style(tables)`** — Every `.meta-table` cell was `text-align:left`, so numeric columns were ragged and hard to compare. Added an opt-in `.num` class (right-align + `tabular-nums`) on the numeric columns of the Units and Leaderboard tables; text columns and the rank index stay left. Also formatted the Units avg-placement to 2 decimals so the column aligns on the decimal (TFT convention).
- **`fix(landing)`** — The homepage was broken: `.page-tagline` carries `margin-top:-24px` to hug a `.page-title`, but SearchPage/DashboardPage have no title, so the tagline yanked up under the navbar and the search bar floated over an empty void. Gave SearchPage a real self-contained `.hero-search` (headline + subtitle + search + quick-links to Leaderboard/Comps/Units), shown only until a search resolves (then PlayerProfile's own identity header takes over). Dropped the out-of-place marketing tagline from the logged-in DashboardPage.

### Earlier today

- **`fix(comps)` `b8988f7`** — Comp cards silently flipped layout based on unit count: `.comp-card-body` was a flex row with `flex-wrap`, so wide boards (many units) pushed the stats block onto a second line (stats *below*) while narrow boards kept it inline (stats *right*). Pinned it to one horizontal layout — `.comp-units` now grows to fill the row (`flex: 1 1 auto; min-width: 0`) and wraps its portraits internally, and `.comp-stats` never shrinks (`flex: 0 0 auto`) — so the avg-place + Top4/Win block sits on the right for every card regardless of roster size. Verified with a headless-Chrome screenshot of `/comps` (6 cards, all aligned).

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
