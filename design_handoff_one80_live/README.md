# Handoff: ONE80 Live — Leaderboard & Stats (visual redesign)

## Overview
This is the **visual design** for *Tour de ONE80 / ONE80 Live* — the read-only leaderboard & stats web app described in the v0.6 build spec. It covers the full leaderboard view: header, challenge switcher, jersey cards, race-day countdown, General Classification table, and the stats block (progress banner, completion heatmap, distance-vs-target bars). It is branded to ONE80 (navy / cobalt / cyan) while keeping the five competition jerseys in their real Tour colors because those colors are functionally meaningful.

This package is the **look-and-feel contract**. The **data model and computations** remain governed by the original build spec (§4 data model, §5 computations). Where this README and the build spec overlap, the build spec is the source of truth for *logic*; this README is the source of truth for *visuals*.

## About the Design Files
The file in this bundle — `ONE80 Live.dc.html` — is a **design reference created in HTML**. It is a self-contained prototype demonstrating the intended look, layout, and interactions. **It is not production code to copy directly.**

Two important notes on how it's built:
1. It uses a small in-house templating runtime (a `<x-dc>` custom element + a `Component` logic class). **Ignore the framework** — read it for markup structure, inline styles (exact colors/spacing/typography), and the logic class for the *computation reference* (GC, penalties, jerseys, heatmap).
2. **All data in the prototype is mock data generated in-browser** so both states look alive. The real app must read the Google Sheet / xlsx per the build spec (§4, §9). The prototype's `compute()` method is a faithful, runnable reference implementation of §5 you can port.

**The task:** recreate this design in the target codebase's environment. The build spec proposes **React + Vite + TypeScript + Tailwind + Recharts + PapaParse/SheetJS** — build it there, using that stack's idioms, and wire it to the live sheet. Recreate the UI **pixel-accurately** (see Fidelity).

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions. Recreate the UI pixel-accurately using the codebase's libraries. Every hex, font, size, and radius below is exact.

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0b1436` | Page background (deep ONE80 navy) |
| `--panel` | `#141f49` | Cards, table, panels |
| `--panel2` | `#1b2860` | Table header row, countdown gradient, raised chips |
| `--line` | `#2b376e` | Borders / hairlines |
| `--cream` | `#eef2fb` | Primary text (near-white) |
| `--muted` | `#93a0c8` | Secondary text |
| `--faint` | `#5f6da0` | Labels, de-emphasized numerals |
| `--brand` | `#2b50e0` | ONE80 cobalt — primary buttons, active toggles |
| `--cyan` | `#35c8f0` | ONE80 sky-cyan accent — countdown digits, "DE", accents |
| `--yellow` | `#f2c200` | **Yellow jersey / GC** (also GC section tick, leader row) |
| `--green` | `#23b061` | **Green jersey / stages** (also progress bars, heatmap "timed") |
| `--red` | `#e2384f` | **Polka-dot jersey / KOM** (also heatmap "miss", DQ badge, danger stat) |
| `--white` | `#e7ecfb` | **White jersey / young rider** |
| `--bordeaux` | `#8a2f3f` | **Most Combative jersey** (accent text `#c76b7a`) |

Brand blues were eyedropped from the ONE80 kit photo — if a brand sheet exists, snap `--brand` / `--cyan` to the official values. Jersey colors are the real Tour de France jersey colors and should not be rebranded.

Page has a subtle texture overlay: `repeating-linear-gradient(135deg, rgba(255,255,255,0.014) 0 1px, transparent 1px 9px)`.

### Typography
- **Display / headings / big numbers:** `'Bebas Neue'` (Google Fonts). All-caps, condensed. Used for the wordmark, jersey holder names, section titles (`h2` 28px, `h3` 22px), countdown digits (44px), GC rank/time, stat-tile big numbers (38px).
- **Body / UI:** `'Barlow'` (Google Fonts), weights 400–800. Rider names 15px/700, table cells 13–15px, subtitles.
- **Labels / uppercase micro-copy:** `'Barlow Semi Condensed'` 600–700, `text-transform:uppercase`, `letter-spacing:1.2–2px`, 10–11px, color `--faint` or `--muted`.
- **All numeric values** (times, gaps, km, elevation) use `font-variant-numeric: tabular-nums`.

Font link:
`https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=Barlow+Semi+Condensed:wght@500;600;700&display=swap`

### Radius & spacing
- Card radius: `12px`. Pills/toggles/badges: `999px`. Small chips: `3px` (jersey crests), `2px` (heatmap cells, mini-bars).
- Content max-width: `1180px`, centered, `20px` horizontal padding.
- Card grid gap: `12px`. Section vertical rhythm: ~`26–34px` between blocks.

### Shadows
- Yellow (GC) jersey card only, emphasized: `0 0 0 1px rgba(242,194,0,0.08), 0 14px 30px -18px rgba(242,194,0,0.4)`.
- Other cards: flat, `1px solid --line`, `border-top: 5px solid <jersey color>`.

---

## Screens / Views

There is one page with two data states (**Pre-tour** and **Mid-tour**) and two challenge boards (**10%** / **20%**), all toggled in-page. Top-to-bottom layout:

### 1. Top ribbon
Full-width, `6px` tall, five equal flex stripes: yellow / green / red / white / bordeaux. Pure decoration + jersey legend.

### 2. Header (sticky, `z-index:40`)
- Background `rgba(9,16,42,0.92)` + `backdrop-filter: blur(8px)`, bottom `1px solid --line`.
- **Left:** wordmark `TOUR DE ONE80` in Bebas 34px — "DE" is `--cyan`, rest `--cream`. Subtitle in Barlow Semi Condensed: `LIVE LEADERBOARD & STATS · 4–26 JUL 2026`.
- **Right:** a "Synced" pill (rounded, `--panel` bg, `--line` border) with a blinking `--green` dot (`@keyframes` opacity 1→0.25, 1.8s), the label, and the last-sync time (tabular). Then a **Refresh** button: `--brand` bg, white text, pill, uppercase Barlow Semi Condensed 11px/700, with a `↻` glyph that spins (`@keyframes` rotate 0.7s linear) while refreshing.

### 3. Controls row
- **Left:** challenge switcher — a pill container (`--panel`, `--line`, `4px` padding) holding two buttons `10% Challenge` / `20% Challenge`. Active = `--brand` bg + white; inactive = transparent + `--muted`. Uppercase Barlow Semi Condensed 11px/700.
- **Right:** "VIEW" label + a second identical pill toggle: `Pre-tour` / `Mid-tour`. (This exists so the design demonstrates both data states; in production this is not a user control — the app derives the state from the schedule per build-spec §5.5. Keep it only if useful for QA.)

### 4. Data-notes strip (validation)
- Collapsed by default: full-width button, `1px dashed --line`, `8px` radius, a `--cyan` dot, `"N data notes"` label, and a right-aligned `Show`/`Hide`. Expands to a list of bullet notes (`--cyan` bullets, `--muted` 12.5px text). This is the non-blocking validation panel from build-spec §9.1.

### 5. Jersey cards (5)
`display:grid; grid-template-columns: repeat(auto-fit, minmax(190px,1fr)); gap:12px`. Each card: `--panel` bg, `1px solid --line`, `border-top:5px solid <jersey color>`, `12px` radius, `16px` padding. Contents:
- A small **jersey crest** (`20×26px`, `3px` radius) in the jersey color, with `inset 0 -8px 0 rgba(0,0,0,.08)` to suggest a hem. The Polka crest is white with a red radial-dot pattern; the whole Polka *card* also has a faint red dot texture.
- A label (Barlow Semi Condensed, uppercase, jersey-colored): `YELLOW · GC`, `GREEN · STAGES`, `POLKA · KOM`, `WHITE · YOUNG`, `COMBATIVE`.
- Holder name in Bebas 32px.
- Figure in `--muted` 13px tabular: Yellow → leader's cumulative time; Green → `N stages`; Polka → `N,NNN m`; White → time; Combative → team name.

Holders/figures for each jersey come from §5.4. Pre-tour state shows `—` and helper sub-text (`Awaiting Stage 1`, etc.).

### 6. Race-day countdown strip
Flex row, `--panel2→--panel` gradient, `border-left:4px solid --cyan`, `12px` radius.
- **Left block:** kicker (`NEXT STAGE IN` / `TOUR STARTS IN`), `Stage N · Jul D` in Bebas 24px, then `<profile> · <target km> km · <target m> m` in `--muted` 12px.
- **Center:** four countdown groups DD : HH : MM : SS. Each digit Bebas 44px; days/hrs/min in `--cyan`, seconds in `--cream`; colons in `--faint` 40px; tiny uppercase unit labels beneath (`DAYS/HRS/MIN/SEC`). Ticks every 1s.
- **Right:** "ROUTES" label + `Zwift · <route>` and `TP · <route>` in `--cream` 13px/600.

Per build-spec §6.2 this is intentionally **secondary** to the leaderboard. (The "pen" of riders-yet-to-post from §6.2 is **not** in this mock — see Not-yet-designed below.)

### 7. General Classification table
Section header: a `5px×22px` yellow tick + `GENERAL CLASSIFICATION` (Bebas 28px) + `10%/20% CHALLENGE` sub-label.
Table is a `--panel` card. Rows are **CSS grid**, not `<table>` (recreate with a real semantic `<table>` in production for a11y — see build-spec §7). Columns:
`grid-template-columns: 44px minmax(120px,1.6fr) 1fr 1fr 1.1fr 0.8fr 1fr` with `8px` gap, `12px 16px` padding.
- Header row: `--panel2` bg, uppercase Barlow Semi Condensed 10.5px/700 `--faint`: `Pos | Rider | Time | Gap | Stages | Miss | Elev` (Elev right-aligned).
- Body row (per rider):
  - **Pos:** Bebas 22px. Leader `--yellow`, else `--faint`.
  - **Rider:** name Barlow 15px/700 (ellipsis) + small jersey **dots** (`9×12px`, `2px` radius) for every jersey that rider currently holds + a `DQ` badge (red outline pill, Barlow Semi Condensed 9px/700) if disqualified. Team name below in `--faint` 11px.
  - **Time:** tabular 15px/700. Leader `--yellow`, else `--cream`.
  - **Gap:** `+m:ss` (or `+h:mm:ss`) in `--muted`; leader shows `—`.
  - **Stages:** `N/21` tabular 13px + a `5px` mini-bar (`--green` fill on `rgba(255,255,255,.08)` track), width = ridden/21.
  - **Miss:** count; color `--muted` (0), `--yellow` (1–2), `--red` (3+).
  - **Elev:** `N,NNN m` right-aligned `--muted`.
  - **Leader row** highlight: `border-left:3px solid --yellow`, `background: rgba(242,194,0,0.06)`.
  - Row divider: `1px solid rgba(255,255,255,0.045)`.
- **Every rider appears**, including DQ'd riders (they keep their computed time/rank but can't hold Yellow/White). Default sort = GC time; DQ'd riders sink below non-DQ. **No horizontal scroll at 375px** (columns compress).

### 8. Tour Stats — banner tiles
Section header: green tick + `TOUR STATS` (Bebas 28px).
`grid repeat(auto-fit, minmax(150px,1fr)) gap:12px`, four `--panel` tiles. Each: uppercase micro-label (`--faint`), Bebas 38px big value, `--muted` 12px sub. The four:
1. **Current Stage** — big value = current stage number, color `--cyan`, sub `of 21 · <profile>`.
2. **Stages Logged** — total timed entries across riders, color `--green`.
3. **Field Distance** — sum of all riders' completed km, color `--cream`, sub `km ridden, all riders`.
4. **Everest Equiv.** — `field elevation / 8849` as `N.N×`, color `--red`, sub `N,NNN m climbed`.

### 9. Completion heatmap
`--panel` card. Title `COMPLETION HEATMAP` (Bebas 22px) + inline legend (Timed=green, Miss=red, Upcoming=`rgba(255,255,255,.07)`, Rest=`--panel2` w/ border).
Grid: `grid-template-columns: 96px repeat(21, 1fr)`, `3px` gap. A header row of stage numbers 1–21, then one row per rider: name (96px, ellipsis) + 21 square cells (`aspect-ratio:1`, `2px` radius). Cell color = timed/miss/upcoming per §5.1/§5.5. Cells carry a `title` tooltip (`Stage N · <time>` / `· missed` / `· upcoming`). The card allows **horizontal scroll on mobile** (`min-width:640px` inner) — this is the only element permitted to scroll sideways.

### 10. Distance vs Target (progress bars)
`--panel` card, title Bebas 22px. One row per rider: name + `X.X / YYY km` (tabular, `--muted`) above a `9px` track (`rgba(255,255,255,.07)`) with a `linear-gradient(90deg, --green, #3fd07f)` fill, width = rider km / full-tour target km.

---

## Interactions & Behavior
- **Challenge switch (10%/20%):** swaps the entire board's dataset; persist in URL `?c=10|20` per build-spec §6.1.
- **Refresh:** button shows a spinning glyph ~700ms, then updates the "last synced" time. In production, wire to the sheet re-fetch (build-spec §9: on load + every 60s + manual).
- **Data-notes strip:** click toggles expand/collapse.
- **Countdown:** re-renders every 1s; when it hits zero, clamp to `00:00:00:00` and roll to the next stage (build-spec §5.5).
- **Jersey dots / DQ / leader highlight:** all derived from computed standings — no manual UI state.
- **Reduced motion:** honor `prefers-reduced-motion` — disable the blink/spin/countdown flourish (build-spec §7).
- Hover/focus states are minimal in the mock; add codebase-standard focus rings for keyboard nav (build-spec §7 requires semantic tables + keyboard nav).

## State Management
Per build-spec §8, keep §5 logic in **pure, unit-tested functions**. UI state needed:
- `challenge: '10' | '20'` (from URL).
- Derived tour state (`current stage`, `closed stages`, `countdown target`, `phase: pre|live|closed|finished`) from the schedule + now (build-spec §5.5).
- `lastSynced` timestamp + `refreshing` flag; 60s polling.
- `notesExpanded` boolean.
- Parsed sheet data → typed `Stage`, `Rider`, `RiderEntry` (build-spec §8 folder layout).

The prototype's `compute(challenge, closedCount, pct)` is a **direct reference port** for: fixed per-stage distance/elevation (§5.2), cumulative GC time with the **slowest+5:00** missed-stage penalty, **3-miss DQ**, gaps-to-leader, jersey selection (§5.4), stage-winner tally, and heatmap cell states. Match its logic exactly, then feed it real sheet data instead of the mock generator. Validate against the build-spec §10 worked example (Kelvin 5:17:00, Rienzo 5:38:10 `+21:10`, Alex DQ).

## Assets
- **Fonts:** Bebas Neue, Barlow, Barlow Semi Condensed (Google Fonts — link above).
- **No image assets** in the design. Jersey crests, dots, heatmap, and progress bars are all pure CSS. If you want a real ONE80 logo in the header, source it from the brand and drop it beside the wordmark.
- **Icons:** only two glyph characters (`↻` refresh, `•` bullet). Swap for the codebase's icon set if preferred.

## Not-yet-designed (flagged for the developer)
These are in the build spec but **not** in this visual mock; design/implement using the same tokens:
- **The "pen"** (riders yet to post while a stage is live) and the live today's-result list — build-spec §6.2.
- **Stage detail** and **rider profile** views — build-spec §6.4 (Later).
- **Later stats:** speed leaders, best climber, streaks, GC-gap timeline — build-spec §6.3.
- **Upload (.xlsx) fallback** UI — build-spec §9.

## Files
- `ONE80 Live.dc.html` — the full design reference (markup = layout + exact inline styles; the `Component` class = computation reference). Open it in a browser to see both states and both challenges live.
