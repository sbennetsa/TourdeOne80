/**
 * Unit tests for stage scheduling (10 cases per plan)
 */

import { describe, it, expect } from "vitest"
import {
  getStageStart,
  getStageState,
  getClosedStages,
  getRaceState,
  formatCountdown,
} from "./scheduler"
import { mockStages } from "../data/mockData"
import { Stage } from "../types"

describe("getStageStart", () => {
  const stage = mockStages[0]

  it("uses stage.start if present", () => {
    const customStart = new Date(2026, 6, 4, 10, 30)
    const stageWithStart: Stage = { ...stage, start: customStart }
    expect(getStageStart(stageWithStart)).toEqual(customStart)
  })

  it("combines stage date + DAILY_START_TIME when start not present", () => {
    // Assuming DAILY_START_TIME is "09:00"
    const start = getStageStart(stage)
    expect(start.getFullYear()).toBe(2026)
    expect(start.getMonth()).toBe(6) // July (0-indexed)
    expect(start.getDate()).toBe(4)
    expect(start.getHours()).toBe(9)
    expect(start.getMinutes()).toBe(0)
  })
})

describe("getStageState", () => {
  const stage = mockStages[0]

  it("returns 'upcoming' when now < stage start", () => {
    const stageStart = getStageStart(stage)
    const before = new Date(stageStart.getTime() - 60 * 60 * 1000) // 1 hour before
    expect(getStageState(stage, mockStages, before)).toBe("upcoming")
  })

  it("returns 'live' when now is between start and close", () => {
    const stageStart = getStageStart(stage)
    const during = new Date(stageStart.getTime() + 2 * 60 * 60 * 1000) // 2 hours after start
    expect(getStageState(stage, mockStages, during)).toBe("live")
  })

  it("returns 'closed' when now >= close", () => {
    const nextStageStart = getStageStart(mockStages[1])
    const after = new Date(nextStageStart.getTime() + 1000) // after next stage starts
    expect(getStageState(stage, mockStages, after)).toBe("closed")
  })
})

describe("getClosedStages", () => {
  it("returns empty array when no stages are closed (pre-tour)", () => {
    const now = new Date(2026, 5, 1) // June 1 (before tour starts)
    expect(getClosedStages(mockStages, now)).toEqual([])
  })

  it("returns all numeric stages when after all stages close (post-tour)", () => {
    const now = new Date(2026, 8, 1) // September 1 (after tour)
    const closed = getClosedStages(mockStages, now)
    expect(closed).toEqual([1, 2, 3, 4, 5])
  })

  it("returns only closed stages during tour", () => {
    // After stage 2 closes, before stage 3 closes
    const stage2Close = getStageStart(mockStages[2]) // stage 3 starts = stage 2 closes
    const now = new Date(stage2Close.getTime() + 60 * 60 * 1000) // 1 hour after
    const closed = getClosedStages(mockStages, now)
    expect(closed).toContain(1)
    expect(closed).toContain(2)
    expect(closed).not.toContain(3)
  })
})

describe("getRaceState", () => {
  it("returns currentStage=null pre-tour", () => {
    const now = new Date(2026, 5, 1)
    const state = getRaceState(mockStages, now)
    expect(state.currentStage).toBeNull()
    expect(state.currentStageState).toBe("upcoming")
    expect(state.next_stage?.number).toBe(1)
  })

  it("returns currentStage=null post-tour", () => {
    const now = new Date(2026, 8, 1)
    const state = getRaceState(mockStages, now)
    expect(state.currentStage).toBeNull()
    expect(state.currentStageState).toBe("finished")
    expect(state.next_stage).toBeNull()
  })

  it("returns currentStage when live", () => {
    const stageStart = getStageStart(mockStages[0])
    const now = new Date(stageStart.getTime() + 60 * 60 * 1000)
    const state = getRaceState(mockStages, now)
    expect(state.currentStage?.number).toBe(1)
    expect(state.currentStageState).toBe("live")
  })

  it("computes countdown to next stage start", () => {
    const stage1Start = getStageStart(mockStages[0])
    const now = stage1Start // exactly at stage 1 start
    const state = getRaceState(mockStages, now)
    // Should count down to stage 2 start
    const expectedCountdown = Math.floor((getStageStart(mockStages[1]).getTime() - now.getTime()) / 1000)
    expect(state.countdown_seconds).toBe(expectedCountdown)
  })
})

describe("formatCountdown", () => {
  it("formats 0s as 00:00:00:00", () => {
    expect(formatCountdown(0)).toBe("00:00:00:00")
  })

  it("formats 3661s (1 hour, 1 minute, 1 second) as 00:01:01:01", () => {
    expect(formatCountdown(3661)).toBe("00:01:01:01")
  })

  it("formats 86400s (1 day) as 01:00:00:00", () => {
    expect(formatCountdown(86400)).toBe("01:00:00:00")
  })

  it("formats 90061s (1 day, 1 hour, 1 minute, 1 second) as 01:01:01:01", () => {
    expect(formatCountdown(90061)).toBe("01:01:01:01")
  })
})
