/**
 * M3: Leaderboard page
 * Jersey cards + GC table + race-day panel (countdown + pen)
 */

import { useState } from 'react'
import { Challenge } from '../types'
import { JerseyCard } from '../components/JerseyCard'
import { GCTable } from '../components/GCTable'
import { Countdown } from '../components/Countdown'
import { Pen } from '../components/Pen'
import { SyncBadge } from '../components/SyncBadge'
import { ChallengeSwitcher } from '../components/ChallengeSwitcher'
import { useLeaderboard } from '../hooks'

export function Leaderboard() {
  const [challenge, setChallenge] = useState<Challenge>('20')
  const { data, error, isLoading, lastSynced, sync, validationIssues } =
    useLeaderboard(challenge)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tour de ONE80</h1>
          <p className="text-gray-600">Live Leaderboard & Stats</p>
        </div>
        <SyncBadge lastSynced={lastSynced} onRefresh={sync} isLoading={isLoading} />
      </div>

      {/* Challenge Switcher */}
      <ChallengeSwitcher selected={challenge} onChange={setChallenge} />

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <p className="font-semibold text-red-900">Error loading leaderboard</p>
          <p className="text-sm text-red-700">{error}</p>
          <p className="mt-2 text-xs text-red-600">
            Check console for details. Ensure Google Sheet URLs are published as CSV.
          </p>
        </div>
      )}

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <p className="font-semibold text-yellow-900">
            {validationIssues.length} data validation issue(s)
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-700">
            {validationIssues.slice(0, 5).map((issue, i) => (
              <li key={i}>
                {issue.message}
                {issue.location && <span className="text-xs"> ({issue.location})</span>}
              </li>
            ))}
          </ul>
          {validationIssues.length > 5 && (
            <p className="mt-2 text-xs text-yellow-600">
              +{validationIssues.length - 5} more...
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-center">
          <p className="text-blue-900">Loading leaderboard...</p>
        </div>
      )}

      {/* Jersey Cards */}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <JerseyCard type="yellow" holder={data.jerseys.yellow} />
            <JerseyCard type="green" holder={data.jerseys.green} />
            <JerseyCard type="polka" holder={data.jerseys.polka} />
            <JerseyCard type="white" holder={data.jerseys.white} />
            <JerseyCard type="combative" holder={data.jerseys.combative} />
          </div>

          {/* Race-day panel: Countdown + Pen */}
          <Countdown raceState={data.race_state} />

          {/* The Pen (riders in the pen, today's results) */}
          {data.race_state.currentStageState === 'live' && (
            <Pen
              raceState={data.race_state}
              allRiders={data.gc_entries.map(e => e.riderName)}
              stageEntries={[]} // TODO: Connect actual stage entries
            />
          )}

          {/* GC Table */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              General Classification — {challenge}% Challenge
            </h2>
            <GCTable entries={data.gc_entries} />
          </div>
        </>
      )}

      {/* Empty State */}
      {data && data.gc_entries.length === 0 && (
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-center">
          <p className="text-gray-600">
            No riders found for {challenge}% challenge. Check your Google Sheet.
          </p>
        </div>
      )}
    </div>
  )
}
