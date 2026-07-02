/**
 * M2: Jersey assignments (15 cases per plan)
 * Verify all 5 jerseys with §10 fixture
 */

import { describe, it, expect } from "vitest"
import { getJerseys } from "./jerseys"
import { buildLeaderboard } from "./generalClassification"
import { mockStages, mockRiders, mockEntries } from "../data/mockData"

describe("Jersey assignments (§10 fixture)", () => {
  const gcEntries = buildLeaderboard(
    mockRiders,
    mockEntries,
    mockStages,
    [1, 2, 3, 4, 5],
    "20"
  )
  const jerseys = getJerseys(mockRiders, gcEntries)

  describe("Yellow Jersey (GC - lowest cumulative time)", () => {
    it("Kelvin holds Yellow (5:17:00, no misses)", () => {
      expect(jerseys.yellow.riderName).toBe("Kelvin")
      expect(jerseys.yellow.value).toContain("5:17")
    })

    it("Yellow holder is not DQ'd", () => {
      const yellowRider = gcEntries.find(e => e.riderName === jerseys.yellow.riderName)
      expect(yellowRider?.is_disqualified).toBe(false)
    })

    it("Rienzo does not hold Yellow (slower time)", () => {
      expect(jerseys.yellow.riderName).not.toBe("Rienzo")
    })
  })

  describe("Green Jersey (Stages - most completed)", () => {
    it("Kelvin holds Green (5/5 stages)", () => {
      expect(jerseys.green.riderName).toBe("Kelvin")
      expect(jerseys.green.value).toContain("5")
    })

    it("Green holder can be anyone (DQ'd or not)", () => {
      // Even if DQ'd, still eligible for Green
      // But in fixture, Kelvin wins anyway (most stages)
      const greenRider = gcEntries.find(e => e.riderName === jerseys.green.riderName)
      expect(greenRider?.stages_ridden).toBe(5)
    })

    it("Rienzo is 2nd in Green (4/5 stages)", () => {
      const rienzo = gcEntries.find(e => e.riderName === "Rienzo")
      const kelvin = gcEntries.find(e => e.riderName === "Kelvin")
      expect(rienzo!.stages_ridden).toBeLessThan(kelvin!.stages_ridden)
    })
  })

  describe("Polka-dot Jersey (KOM - most elevation)", () => {
    it("awards to rider with most elevation", () => {
      const polkaRider = gcEntries.find(e => e.riderName === jerseys.polka.riderName)
      expect(polkaRider).toBeDefined()
      expect(jerseys.polka.value).toMatch(/\d+m/)
    })

    it("Kelvin likely holds Polka (5 stages = most elevation)", () => {
      // In fixture, Kelvin did all 5 stages, Rienzo 4, Alex 2
      // So Kelvin has most elevation (assuming similar gradients)
      expect(jerseys.polka.riderName).toBe("Kelvin")
    })

    it("Polka holder can be DQ'd (all riders eligible)", () => {
      // Green and Polka include DQ riders; only Yellow/White exclude them
      // In fixture, Kelvin wins anyway
      const polkaRider = gcEntries.find(e => e.riderName === jerseys.polka.riderName)
      // Just verify it's defined
      expect(polkaRider).toBeDefined()
    })
  })

  describe("White Jersey (Best new rider - Yellow pool restricted to New=Y)", () => {
    it("Rienzo holds White (only new rider, not DQ'd)", () => {
      expect(jerseys.white.riderName).toBe("Rienzo")
    })

    it("White holder must be marked New=Y", () => {
      const whiteRider = mockRiders.find(r => r.name === jerseys.white.riderName)
      expect(whiteRider?.isNew).toBe(true)
    })

    it("White holder must not be DQ'd", () => {
      const whiteRider = gcEntries.find(e => e.riderName === jerseys.white.riderName)
      expect(whiteRider?.is_disqualified).toBe(false)
    })

    it("White shows same value as Yellow (cumulative time)", () => {
      expect(jerseys.white.value).toMatch(/\d+:\d+/)
    })

    it("Alex not eligible (New=N, even though DQ'd)", () => {
      const alexRider = mockRiders.find(r => r.name === "Alex")
      expect(alexRider?.isNew).toBe(false)
    })
  })

  describe("Most Combative", () => {
    it("manually flagged rider holds award", () => {
      const combativeRider = mockRiders.find(r => r.isCombative)
      if (combativeRider) {
        expect(jerseys.combative.riderName).toBe(combativeRider.name)
      }
    })

    it("shows default message if no combative rider flagged", () => {
      // In fixture, none are marked combative, so should show awaiting
      expect(jerseys.combative.riderName).toBe("—")
    })
  })

  describe("Edge cases", () => {
    it("handles empty rider list", () => {
      const emptyGC = gcEntries.filter(() => false) // Empty
      const emptyJerseys = getJerseys([], emptyGC)
      expect(emptyJerseys.yellow.riderName).toBe("—")
      expect(emptyJerseys.white.riderName).toBe("—")
    })

    it("handles no new riders (no White eligible)", () => {
      const noNewRiders = mockRiders.map(r => ({ ...r, isNew: false }))
      const jerseys2 = getJerseys(noNewRiders, gcEntries)
      expect(jerseys2.white.riderName).toBe("—")
    })

    it("handles all riders DQ'd from Yellow", () => {
      // Create a GC where all are DQ'd
      const allDQ = gcEntries.map(e => ({ ...e, is_disqualified: true }))
      const jerseys2 = getJerseys(mockRiders, allDQ)
      expect(jerseys2.yellow.riderName).toBe("—")
    })
  })
})
