# Tour de ONE80 — Live Leaderboard & Stats

A React web app for the **Tour de ONE80** virtual cycling challenge (4–26 July 2026). Reads a shared Google Sheet and displays:

- **Live leaderboard** with 5 jersey competitions (Yellow, Green, Polka-dot, White, Most Combative)
- **Race-day panel** with countdown + pen (riders yet to post times)
- **Stats** (progress banner, completion heatmap, per-rider progress bars)

Supports two independent challenges: **10% Challenge** and **20% Challenge**.

## Quick Start

### Prerequisites
- Docker & Docker Compose (no Node installation needed)
- A published Google Sheet with the race data

### Setup with Docker

```bash
# Clone the repo
git clone <repo-url>
cd TourdeOne80

# Configure
# Edit src/config.ts with your Google Sheet URLs and timezone
```

**Windows (PowerShell):**
```powershell
.\dev.ps1       # Start dev server (http://localhost:5173)
.\build.ps1     # Build production bundle
.\test.ps1      # Run unit tests
.\stop.ps1      # Stop containers
.\clean.ps1     # Remove containers and volumes
```

**Mac/Linux (Makefile):**
```bash
make dev        # Start dev server (http://localhost:5173)
make build      # Build production bundle
make test       # Run unit tests
make stop       # Stop containers
make clean      # Remove containers and volumes
```

**Or use docker-compose directly:**
```bash
docker-compose up app              # Dev server
docker-compose run --rm build      # Production build
docker-compose run --rm test       # Run tests
docker-compose down                # Stop containers
docker-compose down -v             # Remove everything
```

### Production Deployment

**Local + Cloudflare Tunnel (Recommended for on-premise)**

```powershell
.\prod.ps1
# Starts production server on http://localhost:3000
# Then use Cloudflare tunnel for public HTTPS access
```

See [DEPLOY.md](DEPLOY.md) for full Cloudflare tunnel setup.

**Static Hosting (GitHub Pages, Netlify, Vercel)**

```bash
make build
# Docker builds to dist/
# Deploy dist/ folder to your hosting service
```

### Without Docker (if you have Node.js 18+)

```bash
npm install
npm run dev
npm run build
npm run test
```

## Project Structure

See [`.claude/CLAUDE.md`](.claude/CLAUDE.md) for the full **10-week development plan**, architecture, and testing strategy.

## Data Entry (for Riders)

Riders enter their **time** for each stage in their column of the shared Google Sheet:
- **Format:** `h:mm:ss` (e.g., `1:08:30`), `mm:ss` (e.g., `52:10`), or decimal minutes (e.g., `52.5`)
- **Blank cell** = stage not ridden (counts as a miss if stage is closed)
- **No completion mark needed** — the time alone signals completion

**Rider entry guide:** See Appendix A of [Tour_de_ONE80_webapp_spec.md](Tour_de_ONE80_webapp_spec.md).

## Configuration

Edit `src/config.ts` to set:
- **Google Sheet URLs** (published as CSV)
- **Timezone** and **daily start time** (for countdown)
- **Jersey colors** and styling thresholds

## Spec & Design

Full specification: [Tour_de_ONE80_webapp_spec.md](Tour_de_ONE80_webapp_spec.md) (v0.6)

Includes:
- Data model (stages, riders, entries)
- Computations (GC, jerseys, penalties, gaps)
- UI features (leaderboard, race-day panel, stats)
- Non-functional requirements (MVP checklist, deployment)

## Testing

```bash
npm run test              # Run unit tests
npm run test:ui          # Open test UI
```

Test coverage includes:
- Time parsing (h:mm:ss, mm:ss, decimal)
- General Classification (cumulative time, missed-stage penalties, 3-miss DQ)
- Jersey assignments (Yellow, Green, Polka-dot, White, Most Combative)
- Stage scheduling (countdown, stage closure)
- §10 fixture (end-to-end worked example)

## Deployment

This is a **static React app** — deploy to any static host:
- **GitHub Pages:** `npm run build && git push`
- **Netlify:** Connect repo, auto-deploys on push
- **Vercel:** Connect repo, auto-deploys on push

The app reads data from a **published Google Sheet** (no backend needed).

## Contributing

See the development plan in [`.claude/CLAUDE.md`](.claude/CLAUDE.md) for task breakdown and milestones.

## License

MIT
