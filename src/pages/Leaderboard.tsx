import { useState } from 'react'
import { Challenge } from '../types'
import { JerseyCard } from '../components/JerseyCard'
import { GCTable } from '../components/GCTable'
import { Countdown } from '../components/Countdown'
import { Pen } from '../components/Pen'
import { useLeaderboard } from '../hooks'

interface Props {
  challenge: Challenge
}

export function Leaderboard({ challenge }: Props) {
  const { data, error, isLoading, validationIssues } = useLeaderboard(challenge)

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-line border-l-4 border-l-jersey-polka bg-panel p-4">
          <p className="font-semibold text-cream">Error loading leaderboard</p>
          <p className="mt-1 text-sm text-muted">{error}</p>
        </div>
      )}


      {/* Loading State */}
      {isLoading && !data && (
        <div className="rounded-lg border border-line border-l-4 border-l-jersey-yellow bg-panel p-4 text-center">
          <p className="text-cream">Loading leaderboard...</p>
        </div>
      )}

      {/* Jersey Cards */}
      {data && (
        <>
          {data.race_state.currentStageState === 'upcoming' && !data.race_state.currentStage ? (
            <div className="rounded-lg border border-line border-l-4 border-l-cyan bg-panel p-6">
              <p className="text-center text-lg font-semibold text-muted">
                Tour hasn't started yet. Check back at the opening ceremony!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <JerseyCard type="yellow" holder={data.jerseys.yellow} />
              <JerseyCard type="green" holder={data.jerseys.green} />
              <JerseyCard type="polka" holder={data.jerseys.polka} />
              <JerseyCard type="white" holder={data.jerseys.white} />
              <JerseyCard type="combative" holder={data.jerseys.combative} />
            </div>
          )}

          {/* Race-day panel: Countdown + Pen */}
          <Countdown raceState={data.race_state} />

          {/* The Pen (riders in the pen, today's results) */}
          {data.race_state.currentStageState === 'live' && (
            <Pen
              raceState={data.race_state}
              allRiders={data.gc_entries.map(e => e.riderName)}
              stageEntries={[]}
            />
          )}

          {/* GC Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-[28px] w-1 bg-jersey-yellow" />
              <h2 className="font-bebas text-[28px] leading-tight text-cream">General Classification</h2>
              <span className="font-label text-xs font-bold uppercase text-faint">{challenge}% Challenge</span>
            </div>

            {data.race_state.closed_stages.length === 0 && data.race_state.currentStageState === 'upcoming' ? (
              <p className="text-muted">Standings will appear after the first stage closes.</p>
            ) : (
              <GCTable entries={data.gc_entries} jerseys={data.jerseys} />
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {data && data.gc_entries.length === 0 && (
        <div className="rounded-lg border border-line border-l-4 border-l-white/20 bg-panel p-4 text-center">
          <p className="text-muted">No riders found for {challenge}% challenge. Check your Google Sheet.</p>
        </div>
      )}
    </div>
  )
}
