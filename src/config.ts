/**
 * Tour de ONE80 configuration
 * Update these values with your Google Sheet URLs and preferences
 */

export const CONFIG = {
  // Google Sheets (published as CSV)
  // Instructions: In Google Sheets, use File > Share > Publish to web
  // Select the tab and CSV format; copy the URL below
  sheets: {
    twentyPercent: "",  // TODO: Add 20% Challenge sheet URL
    tenPercent: "",     // TODO: Add 10% Challenge sheet URL
    riders: "",         // TODO: Add Riders sheet URL
  },

  // Timing & timezone
  TIMEZONE: "UTC",      // e.g., "Europe/Paris", "America/New_York"
  DAILY_START_TIME: "09:00",  // HH:MM format, daily stage start (UTC)
  SYNC_INTERVAL_MS: 60_000,   // Poll Google Sheet every 60 seconds

  // Tour dates
  tourStart: new Date(2026, 6, 4),   // July 4, 2026
  tourEnd: new Date(2026, 6, 26),    // July 26, 2026
  restDays: [13, 20],                // July 13 & 20 (stage numbers, not dates)

  // Jersey colors (Tailwind classes + hex for charts)
  jerseyColors: {
    yellow: "#F2C200",
    polkaDot: "#D62828",
    green: "#1E9E56",
    white: "#E8E8E8",
    combative: "#6B1B47",
  },

  // Disqualification rule
  missThreshold: 3,              // Riders with 3+ missed stages are DQ'd from Yellow/White
  missedStagePenalty: 300,       // seconds (5:00) added to missed stage time in GC

  // Highlight stages for KOM bonus (Later feature)
  highlightStages: [6, 14, 15, 19, 20],

  // General thresholds
  timeWarningThreshold: 4 * 3600,  // Flag times > 4 hours as implausible
  timeMinThreshold: 20 * 60,       // Flag times < 20 minutes as implausible
}

export type Config = typeof CONFIG
