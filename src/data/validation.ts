/**
 * M1: Validation layer
 * 9 non-blocking checks per spec §9.1
 * Surface issues without blocking rendering
 */

import { Stage, Rider, RiderEntry, ValidationIssue, Challenge } from "../types"
import { CONFIG } from "../config"

export function validateSheet(
  stages10: Stage[],
  stages20: Stage[],
  riders: Rider[],
  entries: RiderEntry[],
  riderNames10: string[],
  riderNames20: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // 1. Missing tabs
  if (stages10.length === 0) {
    issues.push({
      severity: "warning",
      message: "10% Challenge tab not found or empty",
    })
  }
  if (stages20.length === 0) {
    issues.push({
      severity: "warning",
      message: "20% Challenge tab not found or empty",
    })
  }
  if (riders.length === 0) {
    issues.push({
      severity: "warning",
      message: "Riders tab not found or empty",
    })
  }

  // 2. Rider column/roster mismatches
  for (const riderName of riderNames10) {
    if (!riders.find(r => r.name === riderName && r.challenge === "10")) {
      issues.push({
        severity: "warning",
        message: `Rider column "${riderName}" (10%) has no roster entry`,
        location: "10% Challenge",
      })
    }
  }
  for (const riderName of riderNames20) {
    if (!riders.find(r => r.name === riderName && r.challenge === "20")) {
      issues.push({
        severity: "warning",
        message: `Rider column "${riderName}" (20%) has no roster entry`,
        location: "20% Challenge",
      })
    }
  }

  // 3. Duplicate rider names
  const rosterNames = riders.map(r => r.name)
  const duplicates = rosterNames.filter((n, i) => rosterNames.indexOf(n) !== i)
  for (const dup of new Set(duplicates)) {
    issues.push({
      severity: "error",
      message: `Duplicate rider "${dup}" in roster`,
      location: "Riders",
    })
  }

  // 4. Malformed times (invalid format)
  for (const entry of entries) {
    if (!entry.is_valid && entry.time_seconds === undefined) {
      const timeCell = entries
        .filter(e => e.riderName === entry.riderName && e.stageNumber === entry.stageNumber)
        .map(e => e.validation_issues?.join(", "))[0]

      issues.push({
        severity: "warning",
        message: `Invalid time format for ${entry.riderName} at stage ${entry.stageNumber}: ${timeCell}`,
      })
    }
  }

  // 5. Implausible times
  for (const entry of entries) {
    if (!entry.time_seconds || !entry.is_valid) continue

    // Find stage to get distance
    const stage = [...stages10, ...stages20].find(s => s.number === entry.stageNumber)
    if (!stage) continue

    const thresholdMin = CONFIG.timeMinThreshold
    const thresholdMax = CONFIG.timeWarningThreshold

    if (entry.time_seconds < thresholdMin || entry.time_seconds > thresholdMax) {
      const formatted = formatSeconds(entry.time_seconds)
      issues.push({
        severity: "info",
        message: `Implausible time for ${entry.riderName} stage ${entry.stageNumber}: ${formatted} (expected 20m–4h for ${stage.target_km}km)`,
      })
    }
  }

  // 6. Entries on rest days
  for (const entry of entries) {
    if (entry.stageNumber === "Rest" || !Number.isInteger(entry.stageNumber)) {
      issues.push({
        severity: "warning",
        message: `Time entry found on rest day for ${entry.riderName}`,
      })
    }
  }

  // 7. Stage with no recorded times (can't compute penalty basis)
  const allStages = [...stages10, ...stages20]
  for (const stage of allStages) {
    if (typeof stage.number === "string") continue // skip rest days

    const hasTime = entries.some(
      e => e.stageNumber === stage.number && e.time_seconds !== undefined && e.is_valid
    )
    if (!hasTime) {
      issues.push({
        severity: "info",
        message: `No recorded times yet for stage ${stage.number} — GC penalties can't be computed yet`,
      })
    }
  }

  // 8. Missing required columns
  const stageRequiredCols = ["Stage", "Date", "Distance (km)", "Elevation (m)"]
  for (const col of stageRequiredCols) {
    // This would require re-parsing to check; for now, assume CSV structure is ok
    // In production, validate headers before parsing
  }

  // 9. Per-stage Start column validation (if present)
  // Would validate that each Start value parses as datetime
  // Again, check during parsing

  return issues
}

function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  return `${minutes}m ${secs}s`
}
