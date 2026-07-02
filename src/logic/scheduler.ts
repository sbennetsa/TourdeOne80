/**
 * M1: Stage scheduler
 * Map date → start datetime, compute current/upcoming/closed stages, countdown
 */

import { Stage, RaceState, StageState } from "../types"
import { CONFIG } from "../config"

/**
 * Compute start datetime for a stage
 * Uses per-stage Start column if present, else global DAILY_START_TIME + Date
 */
export function getStageStart(stage: Stage): Date {
  if (stage.start) return stage.start

  // Parse DAILY_START_TIME (HH:MM) into hours/minutes
  const [hoursStr, minutesStr] = CONFIG.DAILY_START_TIME.split(":")
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)

  // Combine stage date + time
  const start = new Date(stage.date)
  start.setHours(hours, minutes, 0, 0)

  return start
}

/**
 * Get when a stage closes
 * A stage closes when the NEXT stage starts
 * For the last stage or day-before-a-rest-day: end of that day (23:59:59)
 */
export function getStageClose(stage: Stage, allStages: Stage[]): Date {
  const stageIndex = allStages.findIndex(s => s.number === stage.number)
  if (stageIndex === -1 || stageIndex === allStages.length - 1) {
    // Last stage: close at end of day
    const close = new Date(stage.date)
    close.setHours(23, 59, 59, 999)
    return close
  }

  const nextStage = allStages[stageIndex + 1]
  return getStageStart(nextStage)
}

/**
 * Determine stage state (upcoming/live/closed/finished) relative to now
 */
export function getStageState(stage: Stage, allStages: Stage[], now: Date): StageState {
  const start = getStageStart(stage)
  const close = getStageClose(stage, allStages)

  if (now < start) return "upcoming"
  if (now >= start && now < close) return "live"
  if (now >= close) return "closed"

  return "closed"
}

/**
 * Get the set of closed stages (used for GC penalty basis)
 */
export function getClosedStages(allStages: Stage[], now: Date): number[] {
  return allStages
    .filter(s => typeof s.number === "number")
    .filter(s => getStageState(s, allStages, now) === "closed")
    .map(s => s.number as number)
}

/**
 * Compute race state at a given moment
 */
export function getRaceState(allStages: Stage[], now: Date): RaceState {
  // Filter numeric stages (skip rest days)
  const numericStages = allStages.filter(s => typeof s.number === "number")

  // Pre-tour: before first stage
  const firstStage = numericStages[0]
  if (!firstStage || now < getStageStart(firstStage)) {
    const countdown = firstStage
      ? Math.floor((getStageStart(firstStage).getTime() - now.getTime()) / 1000)
      : 0
    return {
      currentStage: null,
      currentStageState: "upcoming",
      countdown_seconds: countdown,
      next_stage: firstStage || null,
      closed_stages: [],
    }
  }

  // Post-tour: after last stage
  const lastStage = numericStages[numericStages.length - 1]
  if (lastStage && now > getStageClose(lastStage, allStages)) {
    return {
      currentStage: null,
      currentStageState: "finished",
      countdown_seconds: 0,
      next_stage: null,
      closed_stages: getClosedStages(allStages, now),
    }
  }

  // Find current/next stage
  let currentStage: Stage | null = null
  let nextStage: Stage | null = null

  for (const stage of numericStages) {
    const state = getStageState(stage, allStages, now)
    if (state === "live") {
      currentStage = stage
      break
    } else if (state === "upcoming") {
      nextStage = stage
      break
    }
  }

  // If no live stage, next is the first upcoming
  if (!nextStage && currentStage) {
    const idx = numericStages.findIndex(s => s.number === currentStage!.number)
    if (idx < numericStages.length - 1) {
      nextStage = numericStages[idx + 1]
    }
  }

  const nextStart = nextStage ? getStageStart(nextStage) : lastStage ? getStageClose(lastStage, allStages) : new Date()
  const countdown = Math.floor((nextStart.getTime() - now.getTime()) / 1000)

  return {
    currentStage,
    currentStageState: currentStage ? getStageState(currentStage, allStages, now) : "upcoming",
    countdown_seconds: Math.max(0, countdown),
    next_stage: nextStage,
    closed_stages: getClosedStages(allStages, now),
  }
}

/**
 * Format countdown as DD:HH:MM:SS
 */
export function formatCountdown(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}
