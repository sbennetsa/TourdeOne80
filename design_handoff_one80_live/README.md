# Handoff: Tour de ONE80 — 2026 Brand Mark, Website Hero & Nav

## Overview
The 2026 logo system for **Tour de ONE80**, a virtual Zwift/TrainingPeaks grand tour run among a group of friends, styled after the Tour de France. This package delivers the finalized brand mark and its two primary applications: the **website landing hero** and the **site navigation logo**.

## About the Design Files
The files in this bundle are **design references created in HTML** — a prototype showing the intended look, not production code to ship directly. The task is to **recreate this design in the target codebase's existing environment** (React, Vue, Astro, plain HTML, etc.) using its established patterns. If no environment exists yet, pick the most appropriate framework and implement there. `Tour de ONE80 Site.dc.html` is a "Design Component" that renders in a browser via the included `support.js`; treat it as a visual spec, not a dependency.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and SVG geometry are all production-ready values — recreate pixel-for-pixel with the codebase's own components.

---

## The Brand Mark (finalized)

The system has three coordinated pieces, all in the **navy + cyan** palette:

1. **Wordmark** — a small tracked kicker `TOUR · DE` sitting above `ONE80` set in Bebas Neue, where the `80` is cyan (`#35c8f0`) and `ONE` is off-white (`#eef2fb`). A tracked strapline `VIRTUAL GRAND TOUR · 2026` carries the year (this is the "edition line" treatment — the year is never a floating superscript).
2. **Hero lockup (website)** — the wordmark scaled large and centered, with a horizontal cyan gradient rule between the wordmark and the strapline.
3. **Nav icon (wheel-in-motion)** — a spoked bicycle wheel with three trailing speed lines, paired with a compact stacked wordmark. Leverages the cycling nature of the tour.

---

## Screens / Views

### 1. Site Navigation Bar
- **Purpose:** Persistent top-of-site brand + navigation.
- **Layout:** Horizontal flex, `space-between`, `max-width: 1240px` centered, padding `16px 40px`. A 5px full-bleed jersey stripe sits directly above it. Bottom border `1px solid rgba(43,55,110,0.5)`.
- **Left — logo lockup** (`display:flex; align-items:center; gap:13px`):
  - **Wheel-in-motion SVG**, `viewBox="0 0 118 100"`, rendered at `56×47`:
    - 3 speed lines at the left (y=34/50/66), `stroke-width:2.4`, `stroke-linecap:round`, cyan at `0.5 / 0.75 / 0.5` opacity, of increasing then decreasing length.
    - Tire: `circle cx=68 cy=50 r=45`, fill `#0b1436`, stroke `#35c8f0` `stroke-width:4`.
    - 8 spokes from hub `(68,50)` to rim `r=38` at 45° intervals, stroke `rgba(53,200,240,0.55)` `stroke-width:1.6`. Rim endpoints: `(106,50) (94.9,76.9) (68,88) (41.1,76.9) (30,50) (41.1,23.1) (68,12) (94.9,23.1)`.
    - Hub: `circle cx=68 cy=50 r=6` fill `#35c8f0`.
  - **Stacked wordmark:** kicker `TOUR DE` (Barlow Semi Condensed, 9px, `letter-spacing:4px`, uppercase, `#8b98c4`, weight 600) over `ONE80` (Bebas Neue, 30px, `letter-spacing:1px`; `ONE` `#eef2fb`, `80` `#35c8f0`).
- **Right — menu:** Barlow Semi Condensed, 12px, uppercase, `letter-spacing:1.5px`, weight 600, `#8b98c4`, `gap:26px`. Items: `STAGES  RIDERS  LEADERBOARD`, then a **Join** pill (`background:#2b50e0`, `#fff`, `border-radius:999px`, padding `9px 18px`).

### 2. Landing Hero
- **Purpose:** Front-door of the site; establish the brand and drive into the tour/leaderboard.
- **Layout:** Centered, `max-width:1240px`, padding `78px 40px 64px`, `text-align:center`. Page background is navy `#0b1436` with a top radial cyan glow (`radial-gradient(circle at 50% 8%, rgba(53,200,240,0.10), transparent 55%)`) plus a faint 135° 1px pinstripe texture at `rgba(255,255,255,0.012)`.
- **Components (top to bottom):**
  - Kicker `TOUR · DE` — Barlow Semi Condensed, 17px, `letter-spacing:9px`, uppercase, `#8b98c4`, weight 600, `padding-left:9px`.
  - Headline `ONE80` — Bebas Neue, **160px**, `line-height:0.74`, `letter-spacing:3px`; `ONE` `#eef2fb`, `80` `#35c8f0`.
  - Rule — `height:3px`, `width:360px` (max 70%), `background:linear-gradient(90deg,transparent,#35c8f0,transparent)`, margin `26px auto 14px`.
  - Strapline `VIRTUAL GRAND TOUR · 2026` — Barlow Semi Condensed, 14px, `letter-spacing:8px`, uppercase, `#5f6da0`, weight 600.
  - Sub-copy — Barlow 16px, `line-height:1.6`, `#93a0c8`, `max-width:500px`. Text: *"21 stages. 23 days. One peloton of friends chasing the yellow jersey across a Zwift & TrainingPeaks grand tour."*
  - CTAs (`display:flex; gap:12px; justify-content:center`): **Enter The Tour** (solid `#2b50e0`, white) and **View Leaderboard** (transparent, `1px solid #2b376e`, `#eef2fb`). Both: Barlow Semi Condensed 13px, uppercase, `letter-spacing:1.5px`, weight 700, `border-radius:999px`, padding `14px 28px`.

### 3. Stat Strip
- **Purpose:** Quick at-a-glance tour facts under the hero.
- **Layout:** `max-width:1240px` centered, `display:grid; grid-template-columns:repeat(4,1fr)`, top+bottom border `1px solid rgba(43,55,110,0.5)`, column dividers `1px solid rgba(43,55,110,0.4)`.
- **Each cell:** big number Bebas Neue 40px `#35c8f0`; label Barlow Semi Condensed 10px uppercase `letter-spacing:2px` `#5f6da0` weight 700. Values: `21 Stages`, `23 Days`, `7 Riders`, `5 Jerseys`.

---

## Interactions & Behavior
- Nav menu items and CTAs are links/buttons; wire to routes (`/stages`, `/riders`, `/leaderboard`, `/join`). Hero CTAs → tour entry and the existing leaderboard app.
- **Hover states (recommended, not in mock):** menu items → `#eef2fb`; Join pill → lighten to `#3a5ff0`; secondary CTA → border `#35c8f0`. Keep transitions ~150ms ease.
- **Optional flourish:** the nav wheel can slowly rotate on hover; keep subtle.
- **Responsive:** below ~720px, collapse nav menu to a hamburger, drop hero `ONE80` to a fluid `clamp(72px, 22vw, 160px)`, stack stat strip to 2×2.

## State Management
Static marketing surface — no app state required. If the counts (stages/days/riders/jerseys) are data-driven, pull from the same source as the leaderboard app.

## Design Tokens
- **Colors:** ink/navy `#0b1436`; deeper `#070b1e`; panel `#141f49`; line `#2b376e`; cyan (accent) `#35c8f0`; brand blue (CTA) `#2b50e0`; cream `#eef2fb`; muted `#8b98c4`; faint `#5f6da0`. Jersey stripe: `#f2c200 #23b061 #e2384f #e7ecfb #8a2f3f`.
- **Typography:** Display — **Bebas Neue**. Labels/UI — **Barlow Semi Condensed** (500/600/700). Body — **Barlow** (400/500/600/700). All from Google Fonts.
- **Radius:** pills `999px`.
- **Texture:** 135° repeating 1px pinstripe at `rgba(255,255,255,0.012)`; top radial cyan glow `rgba(53,200,240,0.10)`.

## Assets
- No raster assets. The bicycle-wheel nav icon is inline SVG (geometry documented above) — reproduce as an SVG component. Fonts load from Google Fonts.
- Full exploration (all logo directions A–D, year treatments, app-header applications, alternative nav marks) lives in `ONE80 Logo.dc.html` at the project root for reference.

## Files
- `Tour de ONE80 Site.dc.html` — the finalized nav + hero + stat strip reference (this bundle).
- `support.js` — runtime that renders the `.dc.html` in a browser (reference only; do not port).
- `../ONE80 Logo.dc.html` — full option board (all turns/directions).
