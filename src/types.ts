/**
 * Core TypeScript types for Tour de ONE80
 */

export type Challenge = "10" | "20"
export type JerseyType = "yellow" | "green" | "polka" | "white" | "combative"
export type Platform = "Zwift" | "TP"
export type StageProfile = "Flat" | "Hilly" | "Mountain" | "Summit"

/** Stage reference data from planner tab */
export interface Stage {
  number: number | "Rest"
  date: Date
  distance_km: number
  elevation_m: number
  target_km: number  // Distance every rider rides (10% or 20% of real)
  profile: StageProfile
  zw_percent: number  // Gradient % for Zwift
  tp_percent: number  // Gradient % for TP Virtual
  notes?: string
  start?: Date       // Optional per-stage roll-out time (else use global DAILY_START_TIME)
  zwift_route?: string  // Route name for Zwift
  tp_route?: string     // Route name for TP/Trainerroad
}

/** Rider metadata from Riders tab */
export interface Rider {
  name: string
  challenge: Challenge
  isNew: boolean     // White jersey eligibility
  team?: string
  platform?: Platform
  isCombative: boolean  // Most Combative holder
}

/** Time entry for a stage (rider's result) */
export interface RiderEntry {
  riderName: string
  stageNumber: number | "Rest"
  time_seconds?: number  // undefined = missed/not ridden
  is_valid: boolean      // False if time was malformed/implausible
  validation_issues?: string[]
}

/** Computed rider result for a single stage */
export interface StageResult {
  riderName: string
  stageNumber: number
  time_seconds?: number
  distance_km: number
  elevation_m: number
  speed_kmh?: number
  is_missed: boolean
  is_closed_stage: boolean
}

/** Computed GC entry (leaderboard row) */
export interface GCEntry {
  rank: number
  riderName: string
  total_time_seconds: number
  gap_to_leader_seconds: number
  gap_display: string  // e.g., "+2:14"
  stages_ridden: number
  stages_missed: number
  total_stages: number  // For display: "12/21"
  total_elevation_m: number
  stage_wins: number
  is_disqualified: boolean  // 3+ misses
  platform?: Platform
  team?: string
}

/** Jersey holder */
export interface JerseyHolder {
  riderName: string
  value: string  // e.g., "4:32:10" (time) or "12,450 m" (elevation)
  gap?: string   // e.g., "+2:14" (for time-based jerseys)
}

/** State of a single stage (for countdown/current stage) */
export type StageState = "upcoming" | "live" | "closed" | "finished"

/** Current race state */
export interface RaceState {
  currentStage: Stage | null
  currentStageState: StageState
  countdown_seconds: number  // Time until next stage start
  next_stage: Stage | null
  closed_stages: number[]    // Stage numbers that are closed (used for GC penalties)
}

/** Validation result */
export interface ValidationIssue {
  severity: "error" | "warning" | "info"
  message: string
  location?: string  // e.g., "20% Challenge, row 5, column Kelvin"
}

/** Parsed sheet data */
export interface SheetData {
  stages: {
    "10": Stage[]
    "20": Stage[]
  }
  riders: Rider[]
  entries: RiderEntry[]
  validation_issues: ValidationIssue[]
}

/** Leaderboard data (for a single challenge) */
export interface LeaderboardData {
  challenge: Challenge
  gc_entries: GCEntry[]
  jerseys: Record<JerseyType, JerseyHolder>
  race_state: RaceState
  last_synced: Date
}
