# Tour de ONE80 — Leaderboard & Stats Web App

## Project Overview

A React+Vite+TypeScript web app that reads a shared Google Sheet for the "Tour de ONE80" virtual cycling challenge and displays:
- **Leaderboard** with 5 jersey competitions (Yellow, Green, Polka-dot, White, Most Combative)
- **Race-day panel** with live countdown + pen (riders yet to post times)
- **Stats** (progress banner, completion heatmap, per-rider progress bars)

**Spec:** See [Tour_de_ONE80_webapp_spec.md](Tour_de_ONE80_webapp_spec.md) (v0.6)  
**MVP deadline:** 4 July 2026 (Tour start)  
**Challenges:** Two independent boards (10% and 20% distance riders)

---

## Development Plan

### Milestones (10 weeks)

| Phase | Duration | Key Deliverable | Status |
|-------|----------|-----------------|--------|
| **M1: Parse & Model** | 12–15d | Google Sheet + .xlsx fallback, time parser, stage scheduler, validation | ⚪ Not started |
| **M2: Logic & Computations** | 10–14d | GC with missed-stage penalties, jerseys, stage winners, §10 fixture tests | ⚪ Not started |
| **M3: Leaderboard + Race-Day UI** | 14–18d | Jersey cards, GC table, countdown, pen, challenge switcher | ⚪ Not started |
| **M4: Stats MVP** | 7–10d | Progress banner, completion heatmap, per-rider progress bars | ⚪ Not started |
| **M5: Polish & Deploy** | 10–14d | Edge states, accessibility, responsive proof, unit tests, documentation | ⚪ Not started |

**Total:** ~10 weeks (or 12–16 weeks part-time)

---

## Architecture

### File Structure
```
src/
├── config.ts                      # URLs, TIMEZONE, DAILY_START_TIME, colors, thresholds
├── types.ts                       # TypeScript: Stage, Rider, RiderEntry, JerseyType, etc.
├── data/
│   ├── googleSheetClient.ts       # Fetch CSV from published Google Sheet
│   ├── excelUpload.ts             # SheetJS: fallback upload parsing
│   ├── sheetParser.ts             # Parse tabs by name, extract stages + riders
│   ├── validation.ts              # 9 non-blocking checks (§9.1)
│   └── mockData.ts                # §10 fixture for testing
├── logic/
│   ├── timeParser.ts              # h:mm:ss / mm:ss / decimal minutes → seconds
│   ├── elevation.ts               # Fixed distance/elevation per stage
│   ├── generalClassification.ts    # Cumulative time, missed penalties, 3-miss DQ, gaps
│   ├── jerseys.ts                 # 5 jersey assignments + tiebreaks
│   ├── scheduler.ts               # Stage start/close times, current stage, countdown
│   └── stats.ts                   # Elevation totals, stage wins, speeds
├── components/
│   ├── JerseyCard.tsx             # 5 cards: Yellow, Green, Polka, White, Combative
│   ├── GcTable.tsx                # Leaderboard: rank, rider, time, gaps, stages, elevation
│   ├── Countdown.tsx              # DD:HH:MM:SS ticker
│   ├── Pen.tsx                    # "N still in the pen" + rider list
│   ├── TodayResult.tsx            # Today's stage times, ranked
│   ├── ChallengeSwitcher.tsx       # 10% ↔ 20% toggle
│   ├── SyncBadge.tsx              # "Last synced HH:MM", refresh button
│   ├── ProgressBanner.tsx         # Tour at a glance
│   ├── Heatmap.tsx                # Riders × stages grid
│   ├── ProgressBar.tsx            # Per-rider distance vs tour total
│   └── ValidationPanel.tsx        # N issues (non-blocking)
├── pages/
│   ├── Leaderboard.tsx            # Jersey cards + GC table + race-day panel (MVP)
│   ├── Stats.tsx                  # Progress banner + heatmap + bars (MVP)
│   └── App.tsx                    # Router, sync loop, data context
├── hooks/
│   ├── useDataSync.ts             # 60s poll + manual refresh
│   ├── useCurrentStage.ts         # Map DateTime to live/closed/upcoming
│   └── useLeaderboard.ts          # Compute GC + jerseys from data
└── index.css                      # Tailwind + grand-tour styling

public/
└── index.html                     # Single-page app entry
```

### Data Flow
```
Google Sheet (CSV)
    ↓
[PapaParse] or [SheetJS] (upload fallback)
    ↓
Tab Parser (extract "20% Challenge", "10% Challenge", "Riders" tabs)
    ↓
Validation Layer (9 checks, surface issues without blocking)
    ↓
Typed Objects (Stage[], Rider[], RiderEntry[])
    ↓
Stage Scheduler (compute start/close times, current stage, closed-stage list)
    ↓
Pure Logic (computeGC, getJerseys, getStageWinner, getStats)
    ↓
React State (Context or Zustand)
    ↓
UI Rendering (Leaderboard + Stats pages)
```

---

## Key Decisions (Defaults Set)

All decisions from §12 have safe defaults; **confirm or override in `config.ts`**:

1. **Stage start time:** Global `DAILY_START_TIME` (e.g., 09:00 UTC) applied to each stage `Date`. Optional per-stage `Start` column for roll-out overrides.  
   → Default: `DAILY_START_TIME = "09:00"`, `TIMEZONE = "UTC"`

2. **Stage close:** When next stage starts. For last stage or day-before-rest-day: end of that day.  
   → Computed in `scheduler.ts`; no config needed.

3. **KOM weighting:** Raw summed elevation (no multiplier on mountain stages for MVP).  
   → Multipliers can be added in M4+.

4. **Tech stack:** React 18+Vite+TypeScript+Tailwind CSS+Recharts+PapaParse+SheetJS.  
   → Frozen; no Backend/Auth/Integrations for MVP.

5. **Cross-challenge:** One rider per challenge. No rider appears on both boards.  
   → Validate in parsing; reject duplicates.

---

## Testing Strategy

### Unit Tests (40+)

**Time Parsing (15 tests):**
- `"1:08:30"` → 3910 seconds
- `"52:10"` → 3130 seconds
- `52.5` (decimal) → 3150 seconds
- Invalid: `"1:60:00"`, `"foo"`, empty string → ignored, not a completion

**Elevation (8 tests):**
- Distance × gradient (platform-based: TP% vs Zw%, default = mean)
- Missing data → 0 elevation
- Summit stages (6, 19) climb once (slight over-statement for MVP)

**General Classification (20 tests):**
- Cumulative time, gaps to leader
- Missed (closed) stages → slowest actual time + 5:00
- 3+ misses → DQ (remove from Yellow/White, keep Green/Polka)
- Edge case: stage with no recorded times yet → excluded from GC (no penalty basis)

**Jerseys (15 tests):**
- Yellow: lowest GC time (tiebreak: fewest misses)
- Green: most stages completed
- Polka-dot: most elevation (tiebreak: more stages)
- White: Yellow among riders with New=Y
- Most Combative: manual flag

**Scheduler (10 tests):**
- Parse stage Date + global start time → start DateTime
- Override with per-stage `Start` column
- Rest days (13, 20 July) skip forward
- Current/upcoming/closed/pre-tour/finished states

**Integration (1 full test):**
- §10 fixture (Kelvin, Rienzo, Alex, S1–S5) → verify all computations end-to-end

---

## Configuration Template (`config.ts`)

```typescript
export const CONFIG = {
  // Google Sheet (published as CSV)
  sheets: {
    twentyPercent: "https://docs.google.com/.../export?format=csv",
    tenPercent: "https://docs.google.com/.../export?format=csv",
    riders: "https://docs.google.com/.../export?format=csv",
  },

  // Timing
  TIMEZONE: "UTC",
  DAILY_START_TIME: "09:00",
  SYNC_INTERVAL_MS: 60_000,

  // Colors & thresholds
  jerseyColors: {
    yellow: "#F2C200",
    polkaDot: "#D62828",
    green: "#1E9E56",
    white: "#E8E8E8",
    combative: "#6B1B47",
  },

  // Highlight stages for KOM multiplier (Later)
  highlightStages: [6, 14, 15, 19, 20],
  
  // Disqualification rule
  missThreshold: 3,
  missedStagePenalty: 300, // seconds (5:00)
};
```

---

## Success Criteria (MVP)

✅ **Data**
- Load live Google Sheet (CSV) + fallback .xlsx upload
- Parse both challenge tabs + Riders tab correctly
- Validate robustly (9 checks, non-blocking)

✅ **Logic**
- Time parsing: `h:mm:ss`, `mm:ss`, decimal minutes, invalid robustly ignored
- GC: cumulative time, missed penalties, 3-miss DQ, gaps to leader
- Jerseys: all 5 with correct tiebreaks
- §10 fixture: Kelvin→Yellow, Rienzo→White, Polka/Green correct, gaps correct, Alex DQ

✅ **UI**
- Jersey cards (5 styled, responsive)
- GC table (sortable, gaps, DQ badges, accessible)
- Countdown ticker (DD:HH:MM:SS, correct stage/date/profile)
- Pen: riders yet to post → result list as times arrive → marked as misses at close
- Challenge switcher (10% ↔ 20%, URL persists)
- Sync badge (HH:MM freshness, manual refresh)
- Stats: progress banner, heatmap, progress bars
- Responsive: 375 px (mobile) and 1440 px (desktop) without horizontal scroll

✅ **Quality**
- Unit tests: >90% coverage of §5 logic
- Accessibility: WCAG AA (contrast, semantic HTML, keyboard, screen reader)
- Edge states: pre-tour, finished, empty data, missing columns
- No crashes on malformed input

✅ **Deployment**
- `npm run build` → `dist/` (Vite)
- Static hosting (GitHub Pages, Netlify, Vercel)
- Live Google Sheet + upload fallback both working
- Organiser + rider entry guides documented

---

## Next Steps

1. **Confirm decisions** from §12 (or accept defaults)
2. **Set up Google Sheet** — publish tabs as CSV; note URLs
3. **Fill `config.ts`** with sheet URLs, timezone, start time
4. **Scaffold M1:**
   - `npm create vite@latest tour-one80 -- --template react-ts`
   - Add Tailwind, Recharts, PapaParse, SheetJS
   - Create `src/` structure above
   - Implement `data/` layer (sheet fetching + parsing)
5. **Parallel (Design):** Use `frontend-design` skill for jersey cards, tables, mobile layout
6. **M2 onwards:** Follow milestone breakdown

---

## Key Notes

- **No backend:** Read-only Google Sheet + in-browser upload. All logic in React.
- **Riders self-report:** No Zwift/TP/Strava integration. Time is self-entered.
- **Safe parsing:** Malformed times are ignored (not counted), never silently altered.
- **Penalty-based GC:** Unlike distance-based, cumulative time makes missed stages matter (slow + 5:00 each).
- **3-miss DQ:** Permanent once triggered for that stage (rider can't recover Yellow/White eligibility).
- **Rest days:** 13 & 20 July skipped in GC; countdown jumps to next stage start.

---

## Resources

- **Spec:** [Tour_de_ONE80_webapp_spec.md](Tour_de_ONE80_webapp_spec.md) — authoritative source
- **Fixture (test data):** §10 (Kelvin, Rienzo, Alex, S1–S5)
- **Rider entry guide:** Appendix A (paste into shared sheet)
