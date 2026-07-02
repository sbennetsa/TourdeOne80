/**
 * M3: Leaderboard page
 * Jersey cards + GC table + race-day panel (countdown + pen)
 */

import React, { useEffect, useState } from 'react'
import { Challenge, LeaderboardData, RiderEntry, Stage, Rider } from '../types'
import { JerseyCard } from '../components/JerseyCard'
import { GCTable } from '../components/GCTable'
import { Countdown } from '../components/Countdown'
import { Pen } from '../components/Pen'
import { SyncBadge } from '../components/SyncBadge'
import { ChallengeSwitcher } from '../components/ChallengeSwitcher'
import { getJerseys } from '../logic/jerseys'
import { buildLeaderboard } from '../logic/generalClassification'

interface Props {
  stages: { "10": Stage[]; "20": Stage[] }
  riders: Rider[]
  entries: RiderEntry[]
  lastSynced: Date
  onRefresh: () => void
  isLoading?: boolean
}

export function Leaderboard({
  stages,
  riders,
  entries,
  lastSynced,
  onRefresh,
  isLoading = false,
}: Props) {
  const [challenge, setChallenge] = useState<Challenge>('20')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)

  useEffect(() => {
    // This would normally be computed from data
    // For now, stub implementation
    // TODO: Connect to actual data sync + race state computation
  }, [challenge, stages, riders, entries])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tour de ONE80</h1>
          <p className="text-gray-600">Live Leaderboard</p>
        </div>
        <SyncBadge lastSynced={lastSynced} onRefresh={onRefresh} isLoading={isLoading} />
      </div>

      {/* Challenge Switcher */}
      <ChallengeSwitcher selected={challenge} onChange={setChallenge} />

      {/* TODO: Connect real leaderboard data and render */}
      <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
        <p className="text-sm text-gray-600">M3 UI components ready • Awaiting data integration</p>
      </div>

      {/* Jersey Cards (would be populated from leaderboardData) */}
      {/* <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {jerseys && (
          <>
            <JerseyCard type="yellow" holder={jerseys.yellow} />
            <JerseyCard type="green" holder={jerseys.green} />
            <JerseyCard type="polka" holder={jerseys.polka} />
            <JerseyCard type="white" holder={jerseys.white} />
            <JerseyCard type="combative" holder={jerseys.combative} />
          </>
        )}
      </div> */}

      {/* Race-day panel: Countdown + Pen */}
      {/* <Countdown raceState={leaderboardData?.race_state} /> */}

      {/* GC Table */}
      {/* <GCTable entries={leaderboardData?.gc_entries || []} /> */}

      {/* Instructions */}
      <div className="space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm">
        <p>
          <strong>Next steps:</strong>
        </p>
        <ul className="list-inside list-disc space-y-1 text-gray-600">
          <li>M3 UI components complete (jersey cards, GC table, countdown, pen)</li>
          <li>Create data hooks (useLeaderboard, useDataSync, useCurrentStage)</li>
          <li>Integrate M1 parsing + M2 logic into React state</li>
          <li>Build Stats page (heatmap, progress banner)</li>
          <li>M5: Responsive polish + deploy</li>
        </ul>
      </div>
    </div>
  )
}
