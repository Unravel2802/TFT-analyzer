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

---

## Planned pages

### Featured (top-level nav, next to Dashboard)

- [ ] **Leaderboard** — top ranked players by region; click through to a profile.
- [x] **Meta / Comps** — best team comps + comp tier list for the live patch.
- [x] **Units** — per-champion stats: avg placement, play rate, best items/traits.
- [ ] **Compare** — two players (or your past vs present) side by side.

### Secondary (inside burger)

- [ ] **Favorites** — players you follow/track.
- [ ] **Notifications** — rank changes, new matches from favorites.
- [ ] **Help / About** — FAQ, data sources, patch info.

---

## Differentiators — what an account unlocks

These are the reason a logged-in TierMind beats a generic stats site. The common
sites are stateless: they look up a name and show global numbers. Because we have
accounts, we can persist *your* history, *your* goals, and *your* notes over time —
and turn raw stats into personal coaching.

### 1. Personal Coach (insights on YOUR games)
Analyze the signed-in user's own match history and surface patterns the player
can't see themselves. Examples:
- "Your avg placement on Stage 4-1 drops 1.4 vs your overall — you over-greed for
  upgrades and leak HP."
- "You place top-4 in 71% of games where you're rolled-down by 3-2, vs 48% when
  you slow-roll."
- "Your worst trait line is Bruisers (avg 5.2); your best is Sorcerers (avg 3.1)."
Not global meta — *your* tendencies.

### 2. Climb Tracker (goals over time)
Set a rank/LP goal ("hit Diamond I by patch end") and track progress like a fitness
app: LP graph over time, games-to-goal pace, current streak. Stateless sites can
only show your current rank — they can't remember where you started.

### 3. Game Journal / Match Notes
Let the user annotate their own matches ("lost — forgot to itemize early", "great
econ, threw at 6"). Builds a searchable personal review log. Pairs with the Coach:
tag mistakes, then see which recurring tag costs you the most placement.

### 4. Tilt / Session Awareness
Detect loss streaks and time-of-day patterns from the user's history:
- "You're 2-game losing streak — your historical avg placement after 2 losses is
  6.1. Consider a break."
- "Your best win rate is mornings; late-night sessions average a full place worse."
Framed gently as awareness, not nagging.

### 5. Personalized Comp Recommendations
Instead of "global best comps", recommend comps weighted by *your own* historical
performance: comps you pilot well + that are strong this patch. "You're great at
Reroll comps and they're S-tier right now — lean in."

### 6. Rival Watchlist
Follow specific players (friends, people just above you in your goal rank) and get
notified when they climb, so you have concrete targets to chase past.

---

## Notes
- File structure for new pages: follow the feature-folder pattern
  (`src/features/<name>/<Name>Page.tsx`), protected via `ProtectedRoute` where the
  page needs auth. Featured pages get a top-level `NavLink`; secondary pages go in
  the burger dropdown.
- The differentiator features (Coach, Climb Tracker, Journal, Tilt) need backend
  work: persisting per-user history, goals, and notes — not just Riot API reads.
