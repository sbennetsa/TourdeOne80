/**
 * M2: Jersey assignments
 * Yellow (GC), Green (stages), Polka-dot (elevation), White (new riders), Most Combative (manual)
 */

import { Rider, GCEntry, JerseyType, JerseyHolder } from "../types"
import { formatTime, formatGap } from "../data/timeParser"

/**
 * Compute all 5 jersey holders for a challenge
 */
export function getJerseys(
  riders: Rider[],
  gcEntries: GCEntry[]
): Record<JerseyType, JerseyHolder> {
  return {
    yellow: getYellowJersey(gcEntries),
    green: getGreenJersey(gcEntries),
    polka: getPolkaJersey(gcEntries),
    white: getWhiteJersey(riders, gcEntries),
    combative: getMostCombative(riders),
  }
}

/**
 * Yellow Jersey: General Classification (lowest cumulative time)
 * Only eligible riders (not DQ)
 */
function getYellowJersey(gcEntries: GCEntry[]): JerseyHolder {
  // Find first non-DQ rider
  const leader = gcEntries.find(e => !e.is_disqualified)

  if (!leader) {
    return { riderName: "—", value: "No eligible leader" }
  }

  return {
    riderName: leader.riderName,
    value: formatTime(leader.total_time_seconds),
  }
}

/**
 * Green Jersey: Points / Stages completed (most stages)
 * Tiebreak: lowest total time (not DQ'd)
 * All riders eligible regardless of DQ
 */
function getGreenJersey(gcEntries: GCEntry[]): JerseyHolder {
  const sorted = [...gcEntries].sort((a, b) => {
    if (a.stages_ridden !== b.stages_ridden) {
      return b.stages_ridden - a.stages_ridden
    }
    return a.total_time_seconds - b.total_time_seconds
  })

  const leader = sorted[0]
  if (!leader) {
    return { riderName: "—", value: "No riders" }
  }

  return {
    riderName: leader.riderName,
    value: `${leader.stages_ridden} stages`,
  }
}

/**
 * Polka-dot Jersey: King of the Mountains (most elevation)
 * Tiebreak: more stages completed
 * All riders eligible
 */
function getPolkaJersey(gcEntries: GCEntry[]): JerseyHolder {
  const sorted = [...gcEntries].sort((a, b) => {
    if (a.total_elevation_m !== b.total_elevation_m) {
      return b.total_elevation_m - a.total_elevation_m
    }
    return b.stages_ridden - a.stages_ridden
  })

  const leader = sorted[0]
  if (!leader) {
    return { riderName: "—", value: "No riders" }
  }

  return {
    riderName: leader.riderName,
    value: `${Math.round(leader.total_elevation_m)}m`,
  }
}

/**
 * White Jersey: Best young/new rider (Yellow within New=Y pool)
 * Tiebreak: fewest misses, then fastest time
 * Only New=Y riders eligible
 * If not DQ'd
 */
function getWhiteJersey(riders: Rider[], gcEntries: GCEntry[]): JerseyHolder {
  // Filter to new riders and non-DQ
  const newRiders = riders
    .filter(r => r.isNew)
    .map(r => r.name)

  const newGC = gcEntries.filter(
    e => newRiders.includes(e.riderName) && !e.is_disqualified
  )

  if (newGC.length === 0) {
    return { riderName: "—", value: "No eligible new riders" }
  }

  // Sort by time (same as Yellow)
  const sorted = newGC.sort((a, b) => {
    if (a.total_time_seconds !== b.total_time_seconds) {
      return a.total_time_seconds - b.total_time_seconds
    }
    return a.stages_missed - b.stages_missed
  })

  const leader = sorted[0]

  return {
    riderName: leader.riderName,
    value: formatTime(leader.total_time_seconds),
    gap: leader.gap_to_leader_seconds === 0 ? undefined : leader.gap_display,
  }
}

/**
 * Most Combative: Manual flag (rider marked in Riders tab)
 */
function getMostCombative(riders: Rider[]): JerseyHolder {
  const combative = riders.find(r => r.isCombative)

  if (!combative) {
    return { riderName: "—", value: "Awaiting award" }
  }

  return {
    riderName: combative.name,
    value: "Most combative rider",
  }
}

/**
 * Check if a rider is eligible for Yellow/White (not DQ'd from 3+ misses)
 */
export function isEligibleForYellow(gcEntry: GCEntry): boolean {
  return !gcEntry.is_disqualified
}
