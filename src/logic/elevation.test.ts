/**
 * Unit tests for elevation calculation (8 cases per plan)
 */

import { describe, it, expect } from "vitest"
import { getElevationGradient, getStageElevation } from "./elevation"
import { mockStages, mockRiders } from "../data/mockData"

describe("getElevationGradient", () => {
  const stage = mockStages[0]

  it("uses TP% for TP platform riders", () => {
    const rider = { ...mockRiders[0], platform: "TP" as const }
    expect(getElevationGradient(stage, rider)).toBe(stage.tp_percent * 10)
  })

  it("uses Zw% for Zwift platform riders", () => {
    const rider = { ...mockRiders[0], platform: "Zwift" as const }
    expect(getElevationGradient(stage, rider)).toBe(stage.zw_percent * 10)
  })

  it("uses mean of both when platform not specified", () => {
    const gradient = getElevationGradient(stage, undefined)
    const expected = ((stage.zw_percent + stage.tp_percent) / 2) * 10
    expect(gradient).toBe(expected)
  })

  it("uses mean when platform is undefined", () => {
    const rider = { ...mockRiders[0], platform: undefined }
    const gradient = getElevationGradient(stage, rider)
    const expected = ((stage.zw_percent + stage.tp_percent) / 2) * 10
    expect(gradient).toBe(expected)
  })
})

describe("getStageElevation", () => {
  const stage = mockStages[0]

  it("calculates elevation as target_km × gradient (default)", () => {
    const gradient = ((stage.zw_percent + stage.tp_percent) / 2) * 10
    const expected = stage.target_km * gradient
    expect(getStageElevation(stage, undefined)).toBe(expected)
  })

  it("calculates elevation for TP rider", () => {
    const rider = { ...mockRiders[0], platform: "TP" as const }
    const expected = stage.target_km * (stage.tp_percent * 10)
    expect(getStageElevation(stage, rider)).toBe(expected)
  })

  it("calculates elevation for Zwift rider", () => {
    const rider = { ...mockRiders[0], platform: "Zwift" as const }
    const expected = stage.target_km * (stage.zw_percent * 10)
    expect(getStageElevation(stage, rider)).toBe(expected)
  })

  it("handles stage with 0 gradient", () => {
    const flatStage = { ...stage, zw_percent: 0, tp_percent: 0 }
    expect(getStageElevation(flatStage, undefined)).toBe(0)
  })

  it("handles stage with 0 target distance", () => {
    const zeroStage = { ...stage, target_km: 0 }
    expect(getStageElevation(zeroStage, undefined)).toBe(0)
  })
})
