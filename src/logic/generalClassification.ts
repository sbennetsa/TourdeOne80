/**
 * M2: General Classification logic
 * Cumulative time, missed-stage penalties, 3-miss DQ, gaps, stage ridden count
 */

import { Stage, RiderEntry, Rider, GCEntry } from "../types"
import { formatTime, formatGap } from "../data/timeParser"
import { CONFIG } from "../config"

interface RiderStats {
  riderName: string
  total_time_seconds: number
  stages_ridden: number
  stages_missed: number
  is_disqualified: boolean
  total_elevation_m: number
}

/**
 * Compute GC for a single rider
 * Cumulative time over all closed stages:
 *   - Timed stages → rider's time
 *   - Missed (closed stage with no time) → slowest actual time + 5:00
 * DQ if 3+ missed stages
 */
export function computeRiderGC(
  riderName: string,
  riderEntries: RiderEntry[],
  allStages: Stage[],
  closedStages: number[]
): RiderStats {
  const riderTimes = riderEntries.filter(e => e.riderName === riderName && e.is_valid)

  let totalTime = 0
  let stagesMissed = 0

  // Stages ridden counts every posted time (including the live stage),
  // while GC time/misses/DQ below are based on closed stages only
  const stagesRidden = new Set(
    riderTimes.filter(e => e.time_seconds !== undefined).map(e => e.stageNumber)
  ).size

  for (const stageNum of closedStages) {
    const entry = riderTimes.find(e => e.stageNumber === stageNum)
    const stage = allStages.find(s => s.number === stageNum)

    if (!stage) continue

    if (entry?.time_seconds !== undefined) {
      // Rider completed the stage
      totalTime += entry.time_seconds
    } else {
      // Rider missed a closed stage — penalty basis is the slowest time
      // posted by ANY rider on that stage, not this rider's own entries
      const slowestTime = getSlowestStageTime(stageNum, riderEntries)
      if (slowestTime !== null) {
        // Apply penalty: slowest + 5:00
        totalTime += slowestTime + CONFIG.missedStagePenalty
      }
      stagesMissed++
    }
  }

  const isDQ = stagesMissed >= CONFIG.missThreshold
  const totalElevation = computeTotalElevation(riderName, riderEntries, allStages)

  return {
    riderName,
    total_time_seconds: totalTime,
    stages_ridden: stagesRidden,
    stages_missed: stagesMissed,
    is_disqualified: isDQ,
    total_elevation_m: totalElevation,
  }
}

/**
 * Get the slowest actual time for a given stage (from all riders)
 * Used as penalty basis for missed stages
 * Returns null if no rider has recorded a time yet
 */
export function getSlowestStageTime(
  stageNum: number,
  allEntries: RiderEntry[]
): number | null {
  const stageTimes = allEntries
    .filter(e => e.stageNumber === stageNum && e.time_seconds !== undefined && e.is_valid)
    .map(e => e.time_seconds!) as number[]

  if (stageTimes.length === 0) return null
  return Math.max(...stageTimes)
}

/**
 * Compute total elevation for a rider (sum of all completed stages)
 */
export function computeTotalElevation(
  riderName: string,
  riderEntries: RiderEntry[],
  allStages: Stage[]
): number {
  let total = 0
  const riderTimes = riderEntries.filter(e => e.riderName === riderName && e.is_valid)

  for (const entry of riderTimes) {
    if (entry.time_seconds !== undefined) {
      const stage = allStages.find(s => s.number === entry.stageNumber)
      if (stage) {
        // Fixed per-stage elevation (mean gradient)
        const gradient = ((stage.zw_percent + stage.tp_percent) / 2) * 10
        total += stage.target_km * gradient
      }
    }
  }

  return total
}

/**
 * Compute total distance ridden (sum of target km for completed stages)
 */
export function computeTotalDistance(
  riderName: string,
  riderEntries: RiderEntry[],
  allStages: Stage[]
): number {
  let total = 0
  const riderTimes = riderEntries.filter(e => e.riderName === riderName && e.is_valid)

  for (const entry of riderTimes) {
    if (entry.time_seconds !== undefined) {
      const stage = allStages.find(s => s.number === entry.stageNumber)
      if (stage) total += stage.target_km
    }
  }

  return total
}

/**
 * Detect entries that are a manually-recorded "missed stage" penalty rather
 * than a genuine ride. Some organisers record a miss by typing the penalty
 * value (slowest actual time + 5:00) directly into the cell instead of
 * leaving it blank, which would otherwise be double-counted as a completed
 * ride on top of the app's own penalty. Two signatures give it away:
 *   - Two or more riders share the exact same (slowest) time on a stage
 *   - The single slowest time is exactly 5:00 more than the next-slowest
 * Returns a set of "riderName|stageNumber" keys to treat as not-ridden.
 */
export function detectManualMissPenalties(entries: RiderEntry[]): Set<string> {
  const flagged = new Set<string>()

  const stageNumbers = new Set(
    entries.filter(e => typeof e.stageNumber === "number").map(e => e.stageNumber as number)
  )

  for (const stageNum of stageNumbers) {
    const stageEntries = entries.filter(
      e => e.stageNumber === stageNum && e.is_valid && e.time_seconds !== undefined
    )
    if (stageEntries.length < 2) continue

    const sorted = [...stageEntries].sort((a, b) => b.time_seconds! - a.time_seconds!)
    const maxTime = sorted[0].time_seconds!
    const tiedAtMax = sorted.filter(e => e.time_seconds === maxTime)

    if (tiedAtMax.length >= 2) {
      // Shared penalty value copied across multiple riders
      tiedAtMax.forEach(e => flagged.add(`${e.riderName}|${stageNum}`))
      continue
    }

    // Single slowest rider — exactly 5:00 more than the next-slowest
    const secondTime = sorted[1]?.time_seconds
    if (secondTime !== undefined && maxTime - secondTime === CONFIG.missedStagePenalty) {
      flagged.add(`${sorted[0].riderName}|${stageNum}`)
    }
  }

  return flagged
}

/**
 * Strip manually-recorded miss penalties from entries, treating them as
 * not-ridden (time_seconds undefined) so downstream GC/stats logic applies
 * the standard missed-stage penalty exactly once.
 */
export function scrubManualMissPenalties(entries: RiderEntry[]): RiderEntry[] {
  const flagged = detectManualMissPenalties(entries)
  if (flagged.size === 0) return entries

  return entries.map(e =>
    typeof e.stageNumber === "number" && flagged.has(`${e.riderName}|${e.stageNumber}`)
      ? { ...e, time_seconds: undefined }
      : e
  )
}

/**
 * Build full GC leaderboard for all riders in a challenge
 */
export function buildLeaderboard(
  riders: Rider[],
  rawEntries: RiderEntry[],
  stages: Stage[],
  closedStages: number[],
  challenge: "10" | "20"
): GCEntry[] {
  // Filter riders for this challenge
  const challengeRiders = riders.filter(r => r.challenge === challenge)

  // Strip manually-recorded miss penalties so they aren't double-counted
  const entries = scrubManualMissPenalties(rawEntries)

  // Compute stats for each rider
  const stats = challengeRiders.map(r =>
    computeRiderGC(r.name, entries, stages, closedStages)
  )

  // Sort by total time (ascending) — leader is fastest
  // Tiebreak: fewer misses, more stages ridden
  stats.sort((a, b) => {
    if (a.total_time_seconds !== b.total_time_seconds) {
      return a.total_time_seconds - b.total_time_seconds
    }
    if (a.stages_missed !== b.stages_missed) {
      return a.stages_missed - b.stages_missed
    }
    return b.stages_ridden - a.stages_ridden
  })

  // Full-tour target distance for this challenge (rest days excluded)
  const tourTargetKm = stages
    .filter(s => typeof s.number === "number")
    .reduce((sum, s) => sum + s.target_km, 0)

  // Build GC entries with gaps
  const gcEntries: GCEntry[] = stats.map((stat, rank) => {
    const riderObj = challengeRiders.find(r => r.name === stat.riderName)
    const leaderTime = stats[0].total_time_seconds
    const gap = stat.total_time_seconds - leaderTime

    return {
      rank: rank + 1,
      riderName: stat.riderName,
      total_time_seconds: stat.total_time_seconds,
      gap_to_leader_seconds: gap,
      gap_display: gap === 0 ? "—" : formatGap(gap),
      stages_ridden: stat.stages_ridden,
      stages_missed: stat.stages_missed,
      total_stages: stages.length,
      total_elevation_m: stat.total_elevation_m,
      total_distance_km: computeTotalDistance(stat.riderName, entries, stages),
      tour_target_km: tourTargetKm,
      stage_wins: countStageWins(stat.riderName, entries, stages),
      is_disqualified: stat.is_disqualified,
      platform: riderObj?.platform,
      team: riderObj?.team,
    }
  })

  return gcEntries
}

/**
 * Count stage wins for a rider
 */
export function countStageWins(riderName: string, entries: RiderEntry[], stages: Stage[]): number {
  let wins = 0

  for (const stage of stages) {
    if (typeof stage.number === "string") continue // skip rest days
    const winner = getStageWinner(stage.number, entries)
    if (winner === riderName) wins++
  }

  return wins
}

/**
 * Get the fastest rider (stage winner) for a given stage
 */
export function getStageWinner(stageNum: number, entries: RiderEntry[]): string | null {
  const stageTimes = entries
    .filter(
      e =>
        e.stageNumber === stageNum && e.time_seconds !== undefined && e.is_valid
    )
    .sort((a, b) => (a.time_seconds || 0) - (b.time_seconds || 0))

  return stageTimes.length > 0 ? stageTimes[0].riderName : null
}
