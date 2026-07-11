# Tour de ONE80 — Leaderboard & Stats Web App
### Build specification for a coding agent
**Version:** 0.6 (draft for review) · **Change since 0.5:** dropped the `done` mark (a time is the only completion signal); confirmed the existing rider columns need no restructuring; added a **race-day panel** — start countdown + a "pen" of riders yet to post (§6.2). Minor confirmations in §12.

---

## 0. How to use this document
Build spec for a **basic, static web app** that reads the "Tour de ONE80" workbook and shows a live leaderboard plus tour stats. §4 (data model) and §5 (computations) are the contract. **MVP** = required first ship; **Later** = stretch. §12 = open decisions, each with a default so you can start now.

---

## 1. Overview
"Tour de ONE80" is a 21-stage virtual cycling challenge mirroring the 2026 Tour de France (4–26 July 2026). Participants ride **10% or 20%** of each real stage's distance on **Zwift** or **TP Virtual**, on routes pre-selected in the workbook. Two independent challenges (10% and 20%) each have their own riders and leaderboard. Everyone who rides a given stage covers the **same distance** (that day's target), so the competitive variable riders report is their **time**. The app reads the workbook and presents a time-based race board plus stats. **Working title:** *ONE80 Live*.

## 2. Goals & non-goals
**Goals**
- Show who leads each jersey competition, per challenge, at a glance.
- Run a proper time-based general classification (cumulative time, gaps to leader) plus per-stage "stage winners".
- Show progress and motivating stats (elevation equivalents, streaks, speed, completion heatmap).
- Stay trivially deployable/maintainable (no backend, no login).

**Non-goals (MVP)**
- No in-app data entry. **Riders self-report their time into the shared spreadsheet**; the app is a read-only view.
- No accounts/auth, no Zwift/TP/Strava integration, no historical animation (Later).

## 3. Users
- **Riders:** enter their **time** for each stage in their own column of the shared Google Sheet; view the app.
- **Organiser:** owns the sheet/sharing, sets roster metadata (New / Combative / Team), deploys & refreshes the app.
- **Spectators:** view only.

Mobile-first for both entry (Sheets app) and viewing.

---

## 4. Data model — the input contract
Source of truth: the shared **"2026 Tour de ONE80" Google Sheet**. Read tabs **by name and column header**; tolerate unknown columns and blank rows.

### 4.1 Planner tabs — reference **and** rider entry surface
Tabs **`20% Challenge`** and **`10% Challenge`**: stage/route reference columns plus one column per rider (the self-report surface).

**Stage reference columns the app reads:**

| Header | Type | Use |
|---|---|---|
| `Stage` | int or `"Rest Day"` | Stage number; skip rest-day rows |
| `Date` | e.g. `04-Jul` | Map date → stage (year 2026); §5.5 |
| `Distance (km)` | number | Real stage distance |
| `Elevation (m)` | number | Real stage elevation |
| `20% Target (km)` / `10% Target (km)` | number | **The distance every rider rides for that stage** (fixed) |
| `Profile` | string | Flat / Hilly / Mountain / Summit etc. |
| `Zw %`, `TP %` | number | Route gradient (% = m/km ÷ 10); fixes per-stage elevation, §5.2 |
| `Notes` | string | Contextual note |
| `Start` (optional) | date-time | Per-stage roll-out time for the countdown; if absent, the global default (§8) applies to `Date` |

**Rider columns (self-reported time):** each column header matching a roster name (§4.2) is a rider's result column. For each stage row, the cell means:

| Cell value | Interpretation |
|---|---|
| a time — `h:mm:ss`, `mm:ss`, or plain minutes (e.g. `1:08:30`, `52:10`, `52.5`) | the rider **completed** the stage in that time |
| blank | not ridden — if the stage has **closed**, this is a **miss** (§5.3) |

One value per rider per stage — a time and nothing else. Distance and elevation are **not** entered (fixed by the stage, §5.2), and there is **no** completion mark. The existing rider columns in the workbook need no restructuring; riders just type into them.

### 4.2 `Riders` tab (organiser-maintained) — roster metadata
Riders don't edit this; the organiser sets it and updates the Combative holder. One row per rider per challenge.

| Column | Type | Required | Notes |
|---|---|---|---|
| `Rider` | string | yes | Must match the rider's column header in the planner tab |
| `Challenge` | `10`/`20` | yes | Which board |
| `New` | Y/N | yes | White-jersey eligibility (first-timer) |
| `Team` | string | no | Optional grouping |
| `Platform` | `Zwift`/`TP` | no | Picks the gradient in §5.2 (else mean) |
| `Combative` | Y/N | no | Organiser marks the current Most Combative holder |

Seed roster: **20% →** Kelvin, Rienzo (+ slots). **10% →** Justin, Jarrod, Gemma, Nick, Gerrit, Lea, Jordan.

---

## 5. Core computations
Per challenge. Time is the headline metric; distance/elevation are fixed per stage.

### 5.1 Completion
A rider **completed** a stage if the cell holds a valid time. A time is the only completion signal — there is no separate `done` mark.

### 5.2 Fixed per-stage distance & elevation
- **Distance** for a completed stage = the challenge `Target (km)` for that stage (same for all riders).
- **Elevation** for a completed stage = `Target_km × gradient_m_per_km`, where `gradient = (rider.Platform === 'TP' ? TP% : Zw%) × 10`, defaulting to the **mean** of `Zw%`/`TP%`. This is a fixed per-stage value (a per-rider platform only shifts it slightly). Point-to-point summit stages (6, 19) climb once then roll, so this slightly over-states there — acceptable for MVP.

### 5.3 Time & general classification
- **Total time** = Σ recorded times over the rider's **timed** stages. Parse `h:mm:ss` / `mm:ss` / decimal-minutes to seconds.
- **Stage time & stage winner** = fastest recorded time per stage (a proper "stage win"); keep a stage-win tally.
- **Speed** (stat) = stage distance ÷ time.
- **General Classification (Yellow).** GC is **cumulative time over every closed stage** (per §5.5), with missed stages penalised rather than skipped so totals stay comparable:
  - **Timed** → the rider's own time.
  - **Missed** (a **closed** stage with no time) → that stage's **slowest actual time + 5:00**; counts as a miss.
  Riders are ranked by this cumulative time with **gaps to leader** (e.g. `+2:14`) and **stages ridden** shown alongside.
  - **Disqualification:** missing **3 or more consecutive** closed stages removes a rider from the **Yellow (and White)** jersey — they stay on the board flagged `DQ`, and remain eligible for Green, Polka-dot and every stat. DQ is permanent once triggered (the streak breaking with a later completed stage does not un-DQ them). Non-consecutive misses that add up to 3+ do **not** trigger DQ.
  - Edge case: if a past stage has no recorded time from *anyone* yet, it's excluded from GC (no penalty basis) until at least one time exists.

### 5.4 The five jerseys
| Jersey | Metric | Tie-break |
|---|---|---|
| 🟡 **Yellow** (GC) | lowest cumulative time; missed stage = slowest + 5:00; **DQ at 3 consecutive misses** | fewer misses → more stages ridden |
| 🔴 **Polka-dot** (KOM) | most total elevation from completed stages | more stages completed |
| 🟢 **Green** (stages) | most stages completed | lower total time |
| ⚪ **White** (new rider) | Yellow (time GC) restricted to `New = Y` | as Yellow |
| 🏆 **Most Combative** | manual — rider flagged `Combative = Y` | display only |

> **Note on the change:** the workbook originally defined Yellow as "most total distance". With distance fixed per stage that metric becomes a weighted count of stages finished (which is essentially the Green jersey). Recommendation is to move **Yellow to cumulative time** (real-Tour GC), keep Green as stages completed, and show total distance as a stat. Confirm in §12.1.

### 5.5 "Today on tour"
Map each stage `Date` (+2026, in `TIMEZONE`) to a **start datetime** — the `Start` column if present, else `Date` at the global `DAILY_START_TIME` (§8). Each stage is **upcoming** (before start), **live** (start until close), or **closed**. A stage **closes** when the next stage starts (for the final stage, or the day before a rest day, at end of that day). Derive: the **current stage** (the live one, else the next upcoming), the **countdown target** (next start), the set of **closed** stages (these feed GC misses, §5.3), rest days (13 & 20 July), and % elapsed. Before 4 Jul → pre-tour; after the last stage closes → final classification.

---

## 6. Features & pages
### 6.1 Leaderboard (MVP — headline)
- Challenge switcher **10% ↔ 20%** (persist in URL, `?c=20`).
- **Jersey cards:** Yellow, Polka-dot, Green, White, Combative — holder + key figure.
- **GC table:** rank, rider, cumulative time, **gap to leader**, **stages ridden** (e.g. `12/21`), **missed** count, total elevation. Penalised (missed) stages flagged; riders with 3+ consecutive misses carry a `DQ` badge and can't hold Yellow. Every rider appears. Sortable; default = GC time.
- **"Last synced" badge** for data freshness.
- Acceptance: correct holders/order + correct gaps for the §10 fixture; no horizontal scroll at 375 px.

### 6.2 Race-day panel (MVP)
Prominent on the home screen; driven by the current-stage state from §5.5.
- **Start countdown:** a live `DD:HH:MM:SS` countdown to the current/next stage's **start**, with stage number, date, profile and the assigned Zwift/TP route names. On rest days it counts to the next stage; pre-tour it counts to Stage 1; after the finish it shows a completed state.
- **The pen:** while a stage is **live**, list the riders (for the selected challenge) **yet to post a time** — they're "in the pen". The moment a rider's time appears (next sync) they leave the pen and drop into a live **today's-result** list ranked by that stage's time. Show a pen count (e.g. "5 still in the pen"). When the stage **closes**, anyone left in the pen is recorded as a **miss** for that stage (feeding §5.3).
- Acceptance: countdown targets the correct start; a rider moves pen → result on the sync after their time is entered; penned riders at close become misses.

### 6.3 Stats / insights
MVP: **tour-progress banner** (today's stage, stages done vs 21, field distance, Everest equivalents); **completion heatmap** (riders × stages, highlight columns marked); **per-rider progress bars** vs distance target.
Later: **stage winners** & stage-win tally; **speed leaders**; best climber (time on highlight stages {6,14,15,19,20}); best against-the-clock (ITT stage 16); **streaks**; personal bests; GC-gap timeline.

### 6.4 Stage detail & rider profile (Later / MVP-inline)
Stage: real stats, assigned Zwift/TP routes, notes, finishers with times ranked. Profile: per-stage times, totals, jerseys held, streak, GC position.

## 7. UX & visual direction
Mobile-first, responsive. Grand-tour feel; jersey-colour accents (yellow `#F2C200`, polka-dot red `#D62828` on white, green `#1E9E56`, white/silver, combative bordeaux). Show times as `h:mm:ss` and gaps as `+m:ss`. Distinguish completed-with-time / completed-no-time / blank; mark rest days; mark unclassified riders. Accessibility: contrast, semantic tables, keyboard nav, `prefers-reduced-motion`. Follow the `frontend-design` skill over template defaults.

## 8. Tech stack & architecture
React + Vite + TypeScript, Tailwind, Recharts, PapaParse (live CSV) + SheetJS (upload fallback). No backend. Layout:
```
src/
  data/        # sheet parsing → typed Stage, Rider, RiderEntry(time)
  logic/       # time parsing, GC, jerseys, stats (pure, unit-tested)
  components/  # JerseyCard, GcTable, Heatmap, ProgressBar, SyncBadge
  pages/       # Leaderboard, Stats
  config.ts    # threshold, highlight stages, colours, data URLs, TIMEZONE, DAILY_START_TIME
```
Keep §5 in pure, unit-tested functions; time parsing especially.

## 9. Data ingestion & refresh
- **Primary — live Google Sheet:** publish to web (per tab as CSV); app fetches on load + every **60 s** + manual refresh; show "last synced HH:MM". URLs in `config.ts`.
- **Fallback — upload `.xlsx`** parsed in-browser (SheetJS).
Handle missing tabs/columns, blank/rest rows, and roster/column mismatches with a non-blocking validation panel.

### 9.1 Self-report data quality
- Parse times robustly (`h:mm:ss` / `mm:ss` / decimal-minutes); any non-empty cell that isn't a valid time is ignored for GC and flagged (a stray mark never counts as a completion).
- Flag implausible times (e.g. a 30 km stage in < 20 min or > 4 h) for organiser review; never silently alter.
- Warn on rider columns with no `Riders` row (and vice-versa), duplicate names, entries on rest-day rows.
- The missed-stage penalty needs ≥1 recorded time on that stage; surface any closed stage that has none (penalty can't be computed yet).
- If a `Start` column is used, validate each value parses; otherwise fall back to the global start time.
- Never block rendering — show the board plus an "N issues" panel.

## 10. Sample data & worked example (for tests)
`20% Challenge`, past stages S1–S5, riders `Kelvin` (New=N), `Rienzo` (New=Y), `Alex` (New=N). Times below; blank = missed.

| Stage | Kelvin | Rienzo | Alex |
|---|---|---|---|
| 1 | 0:32:00 | 0:35:10 | 0:33:00 |
| 2 | 1:08:00 | 1:12:00 | (miss) |
| 3 | 1:29:00 | (miss) | (miss) |
| 4 | 1:10:00 | 1:15:00 | 1:11:00 |
| 5 | 0:58:00 | 1:02:00 | (miss) |

Misses: Kelvin 0, Rienzo 1 (S3), Alex 3 total (S2, S3, S5) — but only S2→S3 run consecutively (streak of 2); S4 is ridden, breaking the streak before the separate S5 miss. Slowest actual time per stage → S3 = 1:29:00, S5 = 1:02:00, etc.

Expected:
- **Penalties:** Rienzo S3 = 1:29:00 + 5:00 = **1:34:00**. Alex S2, S3, S5 likewise each score that stage's slowest + 5:00.
- **Cumulative GC time:** Kelvin **5:17:00**; Rienzo **5:38:10** (incl. the S3 penalty); Alex **5:42:00**.
- **Yellow:** Kelvin leads; Rienzo 2nd at **+21:10**. **Alex is NOT DQ** — 3 total misses, but never 3 *consecutive* (max streak = 2, S2–S3) — Alex ranks 3rd and is Yellow-eligible.
- **Green (stages ridden):** Kelvin 5, Rienzo 4, Alex 2 → **Kelvin**.
- **White** (New=Y pool → Rienzo, eligible with 1 miss): **Rienzo**.
- **Stage winners** (fastest actual time): all Kelvin in this fixture.

Boundary tests: `mm:ss` vs `h:mm:ss` parsing; a missed stage scoring slowest + 5:00; 3 *consecutive* misses (e.g. S2–S3–S4) removing a rider from Yellow but not from Green/Polka; 3 *non-consecutive* misses (as in Alex's case above) NOT triggering DQ; a closed stage with no times excluded from GC.

## 11. Build plan (milestones)
1. **M1 — Parse & model:** planner tabs (reference + time columns) + `Riders` tab → typed objects; time parsing; **stage start/close scheduling (§5.5)**; §9.1 validation. Unit-tested.
2. **M2 — Logic:** fixed distance/elevation, cumulative GC time with missed-stage penalty + 3-consecutive-miss DQ, gaps, jerseys, stage winners; tests incl. §10.
3. **M3 — Leaderboard + race-day UI:** jersey cards, GC table with gaps, challenge switcher, sync badge, **start countdown + the pen** (MVP).
4. **M4 — Stats MVP:** progress banner, completion heatmap, per-rider progress bars.
5. **M5 — Polish & deploy:** responsive; pre-tour/finished/empty states; live + upload modes; static deploy; document organiser + rider workflows.
6. **Later:** stage winners/tally, speed & climbing leaders, profiles, streaks, GC-gap timeline.

## 12. Open decisions (defaults chosen so work can start)
1. ~~Yellow = time GC?~~ **RESOLVED:** Yellow is the time-based GC; Green stays stages completed; distance is a displayed stat.
2. ~~GC metric with partial participation~~ **RESOLVED:** GC = cumulative time; a **missed (closed) stage** scores that stage's **slowest actual time + 5:00**; **missing 3+ consecutive stages disqualifies** from Yellow/White (still eligible for Green/Polka). A time is the only completion signal — no `done` mark.
3. **Stage start time (for the countdown).** Default = a global `DAILY_START_TIME` applied to each stage `Date`, in a configured `TIMEZONE`; optional per-stage `Start` column for exact roll-out times. *Confirm the start time + timezone.*
4. **When a stage "closes"** (locks in misses / empties the pen). Default = when the next stage starts (last stage or day-before-a-rest-day: end of that day). *Confirm.*
5. **KOM weighting.** Default = raw summed elevation. Optional = bonus multiplier on highlight/mountain stages. *Confirm.*
6. **Tech stack / refresh.** Default = React+Vite+Tailwind+Recharts, live published Google Sheet (60 s) + upload fallback. *Confirm, incl. publishing the sheet read-only.*
7. **Cross-challenge riders.** Default = one challenge per rider. *Confirm.*

## 13. Definition of done (MVP)
- Loads the live sheet (and upload fallback); both challenge boards show correct jersey holders, GC order (cumulative time incl. missed-stage penalties, with 3-consecutive-miss DQ) and gaps against the §10 fixtures; every rider shown regardless of stages missed.
- Completion heatmap, progress banner, per-rider progress bars render correctly.
- Race-day panel shows a correct start countdown, and a pen that empties as times arrive; riders still penned at stage close become misses.
- Sync badge shows freshness; §9.1 issues surface without blocking.
- Clean at 375 px and desktop; rest days, un-timed completions, and missing optional columns handled without crashing.
- §5 logic (time parsing, GC/eligibility, jerseys) covered by passing unit tests.

---

## Appendix A — Rider entry guide (paste into the sheet)
> **How to log a stage.** Open your challenge tab (**10%** or **20%**) → find **your name's column** → on the row for the stage you rode, type your **time** as `h:mm:ss` (e.g. `1:08:30`). You always ride that day's set distance, so your time is the only thing to enter — a time means the stage is done. Blank = not ridden. The leaderboard updates itself.
