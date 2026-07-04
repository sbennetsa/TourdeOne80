/**
 * M2: GC logic tests (20 cases per plan)
 * Including full §10 fixture verification
 */

import { describe, it, expect } from "vitest"
import {
  computeRiderGC,
  getSlowestStageTime,
  buildLeaderboard,
  getStageWinner,
} from "./generalClassification"
import { mockStages, mockRiders, mockEntries } from "../data/mockData"

describe("computeRiderGC", () => {
  // All stages are "closed" for this test (cumulative computation)
  const closedStages = [1, 2, 3, 4, 5]

  it("computes Kelvin GC (no misses, all stages completed)", () => {
    const stats = computeRiderGC("Kelvin", mockEntries, mockStages, closedStages)
    // Kelvin: 1920 + 4080 + 5340 + 4200 + 3480 = 19020s = 5:17:00
    expect(stats.total_time_seconds).toBe(19020)
    expect(stats.stages_ridden).toBe(5)
    expect(stats.stages_missed).toBe(0)
    expect(stats.is_disqualified).toBe(false)
  })

  it("computes Rienzo GC (1 miss with penalty)", () => {
    const stats = computeRiderGC("Rienzo", mockEntries, mockStages, closedStages)
    // Rienzo: 2110 + 4320 + (5340+300) + 4500 + 3720 = 20290s = 5:38:10
    expect(stats.total_time_seconds).toBe(20290)
    expect(stats.stages_ridden).toBe(4)
    expect(stats.stages_missed).toBe(1)
    expect(stats.is_disqualified).toBe(false)
  })

  it("marks rider as DQ with 3+ misses (Alex)", () => {
    const stats = computeRiderGC("Alex", mockEntries, mockStages, closedStages)
    // Alex misses 3 stages (2, 3, 5) → DQ
    expect(stats.is_disqualified).toBe(true)
    expect(stats.stages_missed).toBe(3)
  })

  it("excludes non-closed stages from cumulative time", () => {
    // Only count stage 1 as closed
    const stats = computeRiderGC("Kelvin", mockEntries, mockStages, [1])
    expect(stats.total_time_seconds).toBe(1920)
    // stages_ridden counts every posted ride (incl. live stages), not just closed
    expect(stats.stages_ridden).toBe(5)
  })

  it("handles rider with no entries", () => {
    const stats = computeRiderGC("NoRider", mockEntries, mockStages, closedStages)
    // Every missed stage costs slowest actual time + 5:00 penalty:
    // (2110+300) + (4320+300) + (5340+300) + (4500+300) + (3720+300) = 21490
    expect(stats.total_time_seconds).toBe(21490)
    expect(stats.stages_ridden).toBe(0)
    expect(stats.stages_missed).toBe(5)
    expect(stats.is_disqualified).toBe(true) // 5 misses → DQ
  })
})

describe("getSlowestStageTime", () => {
  it("returns slowest time for stage with multiple entries", () => {
    const slowest = getSlowestStageTime(1, mockEntries)
    // Stage 1: Kelvin 1920, Rienzo 2110, Alex 1980 → Rienzo slowest
    expect(slowest).toBe(2110)
  })

  it("returns null when no rider has completed stage", () => {
    // Create entries with no valid times for a stage
    const emptyEntries = mockEntries.filter(e => e.stageNumber !== 1)
    const slowest = getSlowestStageTime(1, emptyEntries)
    expect(slowest).toBeNull()
  })

  it("returns single time when only one rider completed", () => {
    const entryOnlyKelvin = mockEntries.filter(e => e.riderName === "Kelvin")
    const slowest = getSlowestStageTime(4, entryOnlyKelvin)
    expect(slowest).toBe(4200) // Kelvin stage 4 time
  })
})

describe("getStageWinner", () => {
  it("returns fastest rider for stage 1", () => {
    const winner = getStageWinner(1, mockEntries)
    // Stage 1: Kelvin 1920 (fastest), Rienzo 2110, Alex 1980
    expect(winner).toBe("Kelvin")
  })

  it("returns null when no one completed stage", () => {
    const emptyEntries = mockEntries.filter(e => e.stageNumber !== 1)
    const winner = getStageWinner(1, emptyEntries)
    expect(winner).toBeNull()
  })

  it("Kelvin wins all stages in fixture", () => {
    for (let i = 1; i <= 5; i++) {
      const winner = getStageWinner(i, mockEntries)
      expect(winner).toBe("Kelvin")
    }
  })
})

describe("buildLeaderboard (§10 fixture integration)", () => {
  it("builds correct GC order: Kelvin 1st, Rienzo 2nd, Alex DQ", () => {
    const leaderboard = buildLeaderboard(
      mockRiders,
      mockEntries,
      mockStages,
      [1, 2, 3, 4, 5],
      "20"
    )

    expect(leaderboard[0].riderName).toBe("Kelvin")
    expect(leaderboard[0].rank).toBe(1)
    expect(leaderboard[0].is_disqualified).toBe(false)

    expect(leaderboard[1].riderName).toBe("Rienzo")
    expect(leaderboard[1].rank).toBe(2)
    expect(leaderboard[1].is_disqualified).toBe(false)

    expect(leaderboard[2].riderName).toBe("Alex")
    expect(leaderboard[2].is_disqualified).toBe(true)
  })

  it("computes correct gap Kelvin → Rienzo (+21:10)", () => {
    const leaderboard = buildLeaderboard(
      mockRiders,
      mockEntries,
      mockStages,
      [1, 2, 3, 4, 5],
      "20"
    )

    const kelvin = leaderboard.find(e => e.riderName === "Kelvin")!
    const rienzo = leaderboard.find(e => e.riderName === "Rienzo")!

    // Gap = 20290 - 19020 = 1270s = 21:10
    expect(rienzo.gap_to_leader_seconds).toBe(1270)
    expect(kelvin.gap_to_leader_seconds).toBe(0)
    expect(kelvin.gap_display).toBe("—")
  })

  it("shows stages ridden correctly", () => {
    const leaderboard = buildLeaderboard(
      mockRiders,
      mockEntries,
      mockStages,
      [1, 2, 3, 4, 5],
      "20"
    )

    const kelvin = leaderboard.find(e => e.riderName === "Kelvin")!
    const rienzo = leaderboard.find(e => e.riderName === "Rienzo")!
    const alex = leaderboard.find(e => e.riderName === "Alex")!

    expect(kelvin.stages_ridden).toBe(5)
    expect(rienzo.stages_ridden).toBe(4)
    expect(alex.stages_ridden).toBe(2)
  })

  it("marks DQ riders but includes them on board", () => {
    const leaderboard = buildLeaderboard(
      mockRiders,
      mockEntries,
      mockStages,
      [1, 2, 3, 4, 5],
      "20"
    )

    expect(leaderboard.length).toBe(3) // All 3 riders shown
    const dq = leaderboard.find(e => e.is_disqualified)
    expect(dq).toBeDefined()
    expect(dq?.riderName).toBe("Alex")
  })

  it("counts stage wins per rider", () => {
    const leaderboard = buildLeaderboard(
      mockRiders,
      mockEntries,
      mockStages,
      [1, 2, 3, 4, 5],
      "20"
    )

    const kelvin = leaderboard.find(e => e.riderName === "Kelvin")!
    expect(kelvin.stage_wins).toBe(5) // Wins all 5 stages
  })

  it("handles partial closed stage list (early in tour)", () => {
    // Only stages 1-2 closed
    const leaderboard = buildLeaderboard(
      mockRiders,
      mockEntries,
      mockStages,
      [1, 2],
      "20"
    )

    const kelvin = leaderboard.find(e => e.riderName === "Kelvin")!
    // Kelvin: 1920 + 4080 = 6000s (GC time only counts closed stages)
    expect(kelvin.total_time_seconds).toBe(6000)
    // stages_ridden counts every posted ride (incl. live stages)
    expect(kelvin.stages_ridden).toBe(5)
  })
})
