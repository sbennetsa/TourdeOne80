/**
 * M1: Sheet parsing
 * Parse CSV into typed Stage, Rider, RiderEntry objects
 * Tab names: "20% Challenge", "10% Challenge", "Riders"
 * Read by header; tolerate unknown columns and blank rows
 */

import Papa from "papaparse"
import { Stage, Rider, RiderEntry, Challenge, Platform, StageProfile } from "../types"
import { parseTime } from "./timeParser"

interface CsvRow {
  [key: string]: string
}

export function parseCsv(csv: string): CsvRow[] {
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true })
  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse error: ${parsed.errors[0].message}`)
  }
  return parsed.data as CsvRow[]
}

/**
 * Parse planner tab (20% or 10% Challenge)
 * Extract stage reference + rider time columns
 */
export function parseChallengePlannerTab(
  csv: string,
  challenge: Challenge
): { stages: Stage[]; riderNames: string[] } {
  const rows = parseCsv(csv)
  if (rows.length === 0) return { stages: [], riderNames: [] }

  const headers = Object.keys(rows[0])
  const stages: Stage[] = []
  const riderNames: string[] = []

  // Stage reference columns (constant per challenge)
  const stageCol = headers.find(h => h.toLowerCase().includes("stage"))
  const dateCol = headers.find(h => h.toLowerCase().includes("date"))
  const distanceCol = headers.find(h => h.toLowerCase().includes("distance"))
  const elevationCol = headers.find(h => h.toLowerCase().includes("elevation"))
  const targetCol = headers.find(
    h => h.toLowerCase().includes("target") && h.toLowerCase().includes(challenge)
  )
  const profileCol = headers.find(h => h.toLowerCase().includes("profile"))
  const zwCol = headers.find(h => h.toLowerCase().includes("zw") && !h.toLowerCase().includes("route"))
  const tpCol = headers.find(h => h.toLowerCase().includes("tp") && !h.toLowerCase().includes("route"))
  const notesCol = headers.find(h => h.toLowerCase().includes("notes"))
  const startCol = headers.find(h => h.toLowerCase().includes("start"))
  const zwiftRouteCol = headers.find(h => h.toLowerCase().includes("zwift route") || h.toLowerCase().includes("zw route"))
  const tpRouteCol = headers.find(h => h.toLowerCase().includes("tp route") || h.toLowerCase().includes("trainerroad route"))

  // Identify rider columns (any header not in the reference list)
  const refCols = new Set([
    stageCol, dateCol, distanceCol, elevationCol, targetCol,
    profileCol, zwCol, tpCol, notesCol, startCol, zwiftRouteCol, tpRouteCol,
  ].filter(Boolean))

  const potentialRiderCols = headers.filter(h => !refCols.has(h) && h.trim())
  riderNames.push(...potentialRiderCols)

  // Parse stage rows
  for (const row of rows) {
    const stageVal = row[stageCol!]?.trim()

    // Skip rest-day rows
    if (stageVal?.toLowerCase().includes("rest")) {
      continue
    }

    const stageNum = parseInt(stageVal, 10)
    if (isNaN(stageNum) || stageNum < 1) continue

    const dateStr = row[dateCol!]?.trim()
    if (!dateStr) continue

    // Parse date (e.g., "04-Jul" → July 4, 2026)
    const date = parseDate(dateStr, 2026)
    if (!date) continue

    const distance = parseFloat(row[distanceCol!] || "0")
    const elevation = parseFloat(row[elevationCol!] || "0")
    const target = parseFloat(row[targetCol!] || "0")
    const profile = (row[profileCol!]?.trim() || "Flat") as StageProfile
    const zw = parseFloat(row[zwCol!] || "0")
    const tp = parseFloat(row[tpCol!] || "0")
    const notes = row[notesCol!]?.trim()
    const startStr = row[startCol!]?.trim()
    const startDate = startStr ? parseDateTime(startStr) : undefined
    const zwiftRoute = row[zwiftRouteCol!]?.trim()
    const tpRoute = row[tpRouteCol!]?.trim()

    const stage: Stage = {
      number: stageNum,
      date,
      distance_km: distance,
      elevation_m: elevation,
      target_km: target,
      profile,
      zw_percent: zw,
      tp_percent: tp,
      notes,
      start: startDate || undefined,
      zwift_route: zwiftRoute || undefined,
      tp_route: tpRoute || undefined,
    }

    stages.push(stage)
  }

  return { stages, riderNames }
}

/**
 * Parse Riders tab
 */
export function parseRidersTab(csv: string): Rider[] {
  const rows = parseCsv(csv)
  if (rows.length === 0) return []

  const headers = Object.keys(rows[0])
  const riderCol = headers.find(h => h.toLowerCase() === "rider")
  const challengeCol = headers.find(h => h.toLowerCase() === "challenge")
  const newCol = headers.find(h => h.toLowerCase() === "new")
  const teamCol = headers.find(h => h.toLowerCase() === "team")
  const platformCol = headers.find(h => h.toLowerCase() === "platform")
  const combativeCol = headers.find(h => h.toLowerCase() === "combative")

  const riders: Rider[] = []

  for (const row of rows) {
    const name = row[riderCol!]?.trim()
    if (!name) continue

    const challengeStr = row[challengeCol!]?.trim()
    if (!challengeStr || !["10", "20"].includes(challengeStr)) continue

    const isNew = row[newCol!]?.trim().toLowerCase() === "y"
    const team = row[teamCol!]?.trim() || undefined
    const platform = (row[platformCol!]?.trim() || undefined) as Platform | undefined
    const isCombative = row[combativeCol!]?.trim().toLowerCase() === "y"

    riders.push({
      name,
      challenge: challengeStr as Challenge,
      isNew,
      team,
      platform,
      isCombative,
    })
  }

  return riders
}

/**
 * Parse rider time entries from planner tab
 */
export function parseRiderEntries(
  csv: string,
  challenge: Challenge,
  riderNames: string[]
): RiderEntry[] {
  const rows = parseCsv(csv)
  const headers = Object.keys(rows[0])
  const stageCol = headers.find(h => h.toLowerCase().includes("stage"))

  const entries: RiderEntry[] = []

  for (const row of rows) {
    const stageVal = row[stageCol!]?.trim()
    if (!stageVal || stageVal.toLowerCase().includes("rest")) continue

    const stageNum = parseInt(stageVal, 10)
    if (isNaN(stageNum)) continue

    // Parse time for each rider
    for (const riderName of riderNames) {
      const timeCell = row[riderName]?.trim()
      if (!timeCell) continue

      const time_seconds = parseTime(timeCell)
      const is_valid = time_seconds !== undefined

      entries.push({
        riderName,
        stageNumber: stageNum,
        time_seconds,
        is_valid,
        validation_issues: is_valid ? undefined : ["Malformed or invalid time format"],
      })
    }
  }

  return entries
}

/**
 * Helper: parse date string like "04-Jul" to Date in given year
 */
function parseDate(dateStr: string, year: number): Date | null {
  const match = dateStr.match(/^(\d{1,2})-([A-Za-z]+)$/)
  if (!match) return null

  const day = parseInt(match[1], 10)
  const monthStr = match[2].toUpperCase()

  const monthMap: Record<string, number> = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  }

  const month = monthMap[monthStr]
  if (month === undefined || day < 1 || day > 31) return null

  return new Date(year, month, day)
}

/**
 * Helper: parse datetime string (ISO or custom format)
 */
function parseDateTime(dateTimeStr: string): Date | null {
  const parsed = new Date(dateTimeStr)
  return isNaN(parsed.getTime()) ? null : parsed
}
