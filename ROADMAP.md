# TierMind — Roadmap & Feature To-Do

> Status legend: `[ ]` not started · `[~]` placeholder/stub exists · `[x]` shipped

## Shipped

- [x] Search page (guests only; signed-in users redirect to Dashboard)
- [x] Dashboard (own profile + search any player, recent matches, stats, charts)
- [x] Auth (login / signup)
- [x] Match detail page
- [x] Navbar burger menu (Profile, Settings, Sign Out) + Dashboard as top-level link
- [~] Profile page (placeholder)
- [~] Settings page (placeholder)
- [x] Personal Coach (best/worst traits & units from your games)
- [x] Climb Tracker (rank snapshots, goal, progress)
- [x] Sessions/Tilt (streak + time-of-day)
- [x] Game Journal (per-match notes)
- [x] Leaderboard (top-25 apex ladder per region, sortable, public)
- [x] Meta / Comps (best team comps + comp tier list for the live patch)
- [x] Units (per-champion stats: avg placement, play rate, top-4 rate)

---

## Planned pages

These are genuinely net-new pages — no route or component exists yet. Kept
separate from the "feature upgrades" section below, which is about improving
pages that already ship.

### Featured (top-level nav, next to Dashboard)

- [ ] **Compare** — two players (or your past vs present) side by side.
  Route + `ProtectedRoute` wiring already exist (`/compare` → `PlaceholderPage`
  in `App.tsx:78`); only the real page is missing.

### Secondary (inside burger)

- [ ] **Favorites** — players you follow/track. Route already wired
  (`App.tsx:79`), stub content only.
- [ ] **Notifications** — rank changes, new matches from favorites. Route
  already wired (`App.tsx:80`), stub content only.
- [ ] **Help / About** — FAQ, data sources, patch info. Route wired
  (`App.tsx:75`), stub content only.

---

## Feature upgrades to existing pages

The five differentiator pages (Coach, Climb, Sessions, Journal) and the three
meta pages (Units, Comps, Leaderboard) currently run in isolation — each reads
its own slice of match data and none of them talk to each other. The concrete
next step isn't more pages, it's wiring these together so the personal data we
already persist actually shows up where a player is looking. Each item below
names the exact page, the machinery it reuses, and what's net-new.

### 1. Units page — "Your placement" column vs. the meta — ✅ shipped 2026-07-07

**Where:** `frontend/src/features/units/UnitsPage.tsx`
**What changes:** add a 6th column, shown only when signed in, with the
player's own `avg_placement` / `games` on that unit, plus a green/red tint
where they beat or trail the meta average.
**Why it's new:** `UnitsPage` today only calls `getUnitsMeta()` — global
numbers, same for every visitor. There's no per-user row anywhere on it.
**Machinery already there:** `compute_unit_stats()` in
`backend/app/services/units_meta_service.py` is *already* the function that
builds both the global table and the per-user numbers inside Coach
(`coach_service.py:121` calls it on the user's own participants) — same
`unit_id` key on both sides, so joining "your row" to "meta row" is a
dictionary lookup, not new stats logic.
**Net-new work:** a `GET /units/mine` endpoint (or a `mine=true` query param
on the existing units endpoint) that runs `compute_unit_stats()` over the
signed-in user's match history and returns the full list (Coach currently
only exposes top-3/bottom-3 — this needs the *whole* list); a `getMyUnits()`
call in `units/api.ts`; merge-by-`unit_id` in `UnitsPage.tsx`.

### 2. Comps page — mark comps you actually pilot — ✅ shipped 2026-07-07

**Where:** `frontend/src/features/comps/CompsPage.tsx`
**What changes:** on each `CompCard`, if the signed-in user has games in that
exact comp, show a small badge — "You've played this 6x · your avg 3.8" —
so the strongest global comps are visibly cross-referenced against comps the
player already knows how to run.
**Why it's new:** this is the roadmap's old "Personalized Comp
Recommendations" idea, but scoped to something buildable in one page instead
of a new recommendation engine — no new page, just a badge on the existing
cards.
**Machinery already there:** `compute_comp_stats()` in
`backend/app/services/comps_meta_service.py` keys each comp by
`(dominant_trait, carries)` and already produces a `name` field built the
same way for any participant list — running it on the user's own matches
produces directly comparable comp names.
**Net-new work:** a `GET /comps/mine` endpoint running `compute_comp_stats()`
on the user's own matches; in `CompsPage.tsx`, fetch it alongside the global
list (only when a token exists) and look up each global comp's `name` in a
`Map` built from the personal list.

### 3. Coach page — "you vs. the meta" on every stat row — ✅ shipped 2026-07-07

**Where:** `frontend/src/features/coach/CoachPage.tsx` (`InsightCard`)
**What changes:** each unit/trait row already shows the player's own avg vs
their *own* overall average (the `insight-delta` column). Add a second,
lighter-weight delta showing that same unit's *global* meta avg placement,
so "You avg 4.1 on Jinx" sits next to "meta avg 3.2" — i.e. whether the
player under- or over-performs the general population on that pick, not just
their own baseline.
**Why it's new:** Coach currently only compares a player to themselves. It
never touches `units_meta_service`, so it can't say whether a "leak" is a
personal weak spot or a unit that's just weak for everyone right now.
**Machinery already there:** exactly the units-meta table from item 1 — one
extra join in `build_coach()` (`backend/app/services/coach_service.py:112`)
against a cached global `compute_units_meta()` result before returning
`best_units` / `worst_units`.
**Net-new work:** thread a `meta_avg` field onto each `CoachStat` in
`backend/app/schemas/coach.py`; extend the `CoachStat` type in
`frontend/src/types/tft.ts`; render the extra delta in `InsightCard`.

### 4. Journal page — tags instead of free text, plus a tag report — ✅ shipped 2026-07-07

**Where:** `frontend/src/features/journal/JournalPage.tsx`,
`backend/app/repositories/journal.py`
**What changes:** alongside the free-text note, let the player attach one or
more quick tags to a match ("misplayed econ", "int", "good positioning",
"clutch") from a fixed chip list. Add a small panel at the top of the
Journal page: avg placement per tag, e.g. "Games tagged *misplayed econ*:
avg 5.4 vs your 4.2 overall (9 games)" — turning the free-form notes into
the "which recurring mistake costs you the most placement" insight the
roadmap already promised but never built.
**Why it's new:** the `match_notes` table today is just
`{user_id, match_id, note, updated_at}` — no structure to aggregate on, so
this insight was never possible with the current schema.
**Machinery already there:** none of the aggregation exists yet, but it's
the same shape as `compute_trait_stats()` in `coach_service.py` — group by
key, average `placement` — just grouping by tag instead of trait.
**Net-new work:** Supabase migration
`ALTER TABLE match_notes ADD COLUMN tags text[] DEFAULT '{}'`; extend
`NoteRequest`/`NoteEntry` in `backend/app/schemas/journal.py` with `tags:
list[str]`; a tag-report function in a new
`backend/app/services/journal_service.py` (join `match_notes.tags` against
the match's stored `placement`, which requires pulling placement from the
match doc since `match_notes` doesn't store it today); a chip picker in
`JournalPage.tsx`'s `NoteCard`.

### 5. Leaderboard page — show where *you* stand, even off the top-25 — ✅ shipped 2026-07-07

**Where:** `frontend/src/features/leaderboard/LeaderboardPage.tsx`
**What changes:** if signed in and viewing your own region, pin a "You"
row — rank (if resolvable), tier, LP — either highlighted in place if you're
in the visible top 25, or as a sticky row below the header if you're not
("You: Diamond II · 42 LP — 340 LP off the board").
**Why it's new:** `LeaderboardPage` has zero awareness of the signed-in user
today — it's a pure public table.
**Machinery already there:** `RiotClient.get_rank(puuid)` in
`backend/app/clients/riot.py:79` already fetches one summoner's current
tier/division/LP — the same call the Climb tracker uses. The user's
`riot_id`/`region` are already stored on the `users` row from signup.
**Net-new work:** since `build_leaderboard()` in
`leaderboard_service.py` only ever fetches the top 25 per apex tier, "your
rank" for anyone outside Challenger/GM/Master needs a *separate* targeted
`get_rank()` call for the signed-in user's own puuid — it will almost never
already be in the top-25 payload. Add that lookup to the leaderboard
endpoint when a token is present; render the pinned row client-side.

### 6. Climb page — pace projection drawn on the chart itself — ✅ shipped 2026-07-07

**Where:** `frontend/src/features/climb/ClimbPage.tsx` (`LpChart`),
`frontend/src/components/charts/LineChart.tsx`
**What changes:** extend the rank-over-time chart with a dashed projection
line continuing from the last snapshot at the current `lp_per_day` pace out
to the goal — so "ETA ~14 days" (already shown as text in `JourneyStrip`)
becomes something visible on the graph, not just a number.
**Why it's new:** `LpChart` renders exactly one data series today; the pace
math (`lp_per_day`, `eta_days`) already exists in `ClimbJourney` but is never
plotted.
**Machinery already there:** all the numbers — `data.journey.lp_per_day`,
`data.journey.eta_days`, `data.goal.target_abs_lp` — are already returned by
`getMyClimb()`.
**Net-new work:** `LineChart` only supports one values series plus a single
horizontal `referenceY` line — it needs a second, dashed-stroke series prop
(e.g. `projectionValues?: (number | null)[]`) to draw the forecast ray; the
projection points themselves are computed client-side in `ClimbPage.tsx`
from data it already has (no backend change needed).

### 7. Dashboard page — one glanceable "state of your account" strip — ✅ shipped 2026-07-07

**Where:** `frontend/src/features/player/DashboardPage.tsx`
**What changes:** above the existing `PlayerProfile`, add a row of 3 small
chips pulling one live fact from each differentiator page: current streak
(from Sessions), climb pace toward your goal (from Climb), and your single
biggest Coach leak — so Dashboard stops being just a mirror of
`PlayerProfile` and becomes the hub that ties the other pages together.
**Why it's new:** today Dashboard only fetches `getMyDashboard()` /
`getPlayerDashboard()`; it never calls the Coach, Climb, or Sessions APIs, so
none of that work is visible until you navigate away to those pages.
**Machinery already there:** `getMySessions()`, `getMyClimb()`,
`getMyCoach()` all already exist and return exactly the fields needed
(`current_streak`, `journey.eta_days`, `worst_traits[0]` /
`worst_units[0]`) — this is a client-side composition, not new backend work.
**Net-new work:** fire the three existing calls in parallel alongside
`fetchOwn()` in `DashboardPage.tsx` (skip silently if any 404s — e.g. no
climb goal set yet); a small `FocusStrip` component next to
`SearchBar`.

---

## Notes
- File structure for new pages: follow the feature-folder pattern
  (`src/features/<name>/<Name>Page.tsx`), protected via `ProtectedRoute` where the
  page needs auth. Featured pages get a top-level `NavLink`; secondary pages go in
  the burger dropdown.
- File structure for the upgrades above: no new feature folders — every item
  edits files already inside its existing `src/features/<name>/` folder, plus
  (where noted) a new endpoint in the matching `backend/app/services/*.py` +
  `backend/app/api/` route.
- Items 1–4 above reuse existing `compute_*` functions against a *different*
  participant list (the signed-in user's own matches vs. the global sample) —
  this is the recurring pattern for "personalize an existing global stat page,"
  not a one-off trick.
