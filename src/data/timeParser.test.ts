/**
 * Unit tests for time parsing (15 cases per plan)
 */

import { describe, it, expect } from "vitest"
import { parseTime, formatTime, formatGap } from "./timeParser"

describe("parseTime", () => {
  // Valid h:mm:ss format
  it("parses h:mm:ss (1:08:30 → 4110s)", () => {
    expect(parseTime("1:08:30")).toBe(4110)
  })

  // Valid mm:ss format
  it("parses mm:ss (52:10 → 3130s)", () => {
    expect(parseTime("52:10")).toBe(3130)
  })

  it("parses mm:ss (0:45 → 45s)", () => {
    expect(parseTime("0:45")).toBe(45)
  })

  // Valid decimal minutes
  it("parses decimal minutes (52.5 → 3150s)", () => {
    expect(parseTime(52.5)).toBe(3150)
  })

  it("parses decimal as string ('45.25' → 2715s)", () => {
    expect(parseTime("45.25")).toBe(2715)
  })

  // Empty/blank → not ridden
  it("returns undefined for empty string", () => {
    expect(parseTime("")).toBeUndefined()
  })

  it("returns undefined for null", () => {
    expect(parseTime(null)).toBeUndefined()
  })

  it("returns undefined for undefined", () => {
    expect(parseTime(undefined)).toBeUndefined()
  })

  // Invalid formats → ignored, not counted as completion
  it("returns undefined for invalid format 'foo'", () => {
    expect(parseTime("foo")).toBeUndefined()
  })

  it("returns undefined for malformed h:mm:ss (1:60:00 - invalid minute)", () => {
    expect(parseTime("1:60:00")).toBeUndefined()
  })

  it("returns undefined for malformed h:mm:ss (1:30:60 - invalid second)", () => {
    expect(parseTime("1:30:60")).toBeUndefined()
  })

  it("returns undefined for negative time (-5:30)", () => {
    expect(parseTime("-5:30")).toBeUndefined()
  })

  it("returns undefined for just hours (3:)", () => {
    expect(parseTime("3:")).toBeUndefined()
  })

  // Edge cases
  it("parses 0:00:00 (midnight/zero time)", () => {
    expect(parseTime("0:00:00")).toBe(0)
  })

  it("handles leading whitespace '  1:30:00'", () => {
    expect(parseTime("  1:30:00")).toBe(5400)
  })

  it("handles trailing whitespace '1:30:00  '", () => {
    expect(parseTime("1:30:00  ")).toBe(5400)
  })
})

describe("formatTime", () => {
  it("formats 3910s as '1:05:10'", () => {
    expect(formatTime(3910)).toBe("1:05:10")
  })

  it("formats 3130s as '52:10'", () => {
    expect(formatTime(3130)).toBe("52:10")
  })

  it("formats 45s as '0:45'", () => {
    expect(formatTime(45)).toBe("0:45")
  })

  it("formats 0s as '0:00'", () => {
    expect(formatTime(0)).toBe("0:00")
  })
})

describe("formatGap", () => {
  it("formats 1270s as '+21:10'", () => {
    expect(formatGap(1270)).toBe("+21:10")
  })

  it("formats 0s as '—' (leader)", () => {
    expect(formatGap(0)).toBe("—")
  })

  it("formats negative as '—' (shouldn't happen)", () => {
    expect(formatGap(-100)).toBe("—")
  })

  it("formats 60s as '+1:00'", () => {
    expect(formatGap(60)).toBe("+1:00")
  })
})
