/**
 * M3: useLeaderboard hook
 * Fetches, parses, and computes leaderboard data for a challenge
 */

import { useEffect, useState } from 'react'
import { LeaderboardData, Challenge, ValidationIssue, Rider } from '../types'
import { fetchAllSheets } from '../data/googleSheetClient'
import {
  parseChallengePlannerTab,
  parseRiderEntries,
} from '../data/sheetParser'
import { validateSheet } from '../data/validation'
import { getRaceState } from '../logic/scheduler'
import { buildLeaderboard } from '../logic/generalClassification'
import { getJerseys } from '../logic/jerseys'
import { CONFIG } from '../config'

export function useLeaderboard(challenge: Challenge) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSynced, setLastSynced] = useState(new Date())

  const sync = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch sheets (riders sheet not needed - names auto-detected from columns)
      const sheets = await fetchAllSheets(
        CONFIG.sheets.twentyPercent,
        CONFIG.sheets.tenPercent,
        undefined
      )

      // Parse data
      const { stages: stages20, riderNames: riderNames20 } =
        parseChallengePlannerTab(sheets.twentyPercent, '20')
      const { stages: stages10, riderNames: riderNames10 } =
        parseChallengePlannerTab(sheets.tenPercent, '10')

      // Create riders from column names (without requiring a separate Riders tab)
      const createRidersFromNames = (names: string[], chal: Challenge): Rider[] => {
        return names.map(name => ({
          name,
          challenge: chal,
          isNew: false,
          isCombative: false,
        }))
      }

      const riders20 = createRidersFromNames(riderNames20, '20')
      const riders10 = createRidersFromNames(riderNames10, '10')
      const allRiders = [...riders20, ...riders10]

      const entries20 = parseRiderEntries(sheets.twentyPercent, '20', riderNames20)
      const entries10 = parseRiderEntries(sheets.tenPercent, '10', riderNames10)

      // Validate
      const issues = validateSheet(
        stages10,
        stages20,
        allRiders,
        [...entries10, ...entries20],
        riderNames10,
        riderNames20
      )
      setValidationIssues(issues)

      // Compute leaderboard for selected challenge
      const stages = challenge === '20' ? stages20 : stages10
      const entries = challenge === '20' ? entries20 : entries10
      const challengeRiders = challenge === '20' ? riders20 : riders10

      const raceState = getRaceState(stages, new Date())
      const gcEntries = buildLeaderboard(
        challengeRiders,
        entries,
        stages,
        raceState.closed_stages,
        challenge
      )
      const jerseys = getJerseys(challengeRiders, gcEntries)

      setData({
        challenge,
        gc_entries: gcEntries,
        jerseys,
        race_state: raceState,
        entries,
        last_synced: new Date(),
      })

      setLastSynced(new Date())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Leaderboard sync error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load on mount and when challenge changes
  useEffect(() => {
    sync()
  }, [challenge])

  // Auto-sync every 60s
  useEffect(() => {
    const interval = setInterval(sync, CONFIG.SYNC_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [challenge])

  return { data, validationIssues, error, isLoading, lastSynced, sync }
}
