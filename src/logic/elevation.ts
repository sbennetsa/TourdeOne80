/**
 * M1/M2: Elevation calculation
 * Fixed per-stage: target_km × gradient
 * Gradient = (rider.Platform === 'TP' ? TP% : Zw%) × 10, or mean of both
 */

import { Stage, Rider } from "../types"

export function getElevationGradient(stage: Stage, rider?: Rider): number {
  if (rider?.platform === "TP") {
    return stage.tp_percent * 10
  }
  if (rider?.platform === "Zwift") {
    return stage.zw_percent * 10
  }

  // Default: mean of both
  return ((stage.zw_percent + stage.tp_percent) / 2) * 10
}

export function getStageElevation(stage: Stage, rider?: Rider): number {
  const gradient = getElevationGradient(stage, rider)
  return stage.target_km * gradient
}

export function getTotalElevation(stages: Stage[], riderNames: string[], rider?: Rider): number {
  return stages.reduce((sum, stage) => {
    return sum + getStageElevation(stage, rider)
  }, 0)
}
