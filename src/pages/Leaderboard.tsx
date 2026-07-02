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
  const [validationExpanded, setValidationExpanded] = useState(false)

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border-l-4 border-jersey-polka border-line bg-panel p-4">
          <p className="font-semibold text-cream">Error loading leaderboard</p>
          <p className="mt-1 text-sm text-muted">{error}</p>
        </div>
      )}

      {/* Validation Issues Strip */}
      {validationIssues.length > 0 && (
        <>
          <button
            onClick={() => setValidationExpanded(!validationExpanded)}
            className="w-full rounded-lg border-2 border-dashed border-cyan bg-transparent px-4 py-3 text-left font-label text-xs font-bold uppercase text-faint transition-colors hover:bg-white/[0.03]"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan align-middle" /> {validationIssues.length} data issues ·{' '}
            <span className="float-right">{validationExpanded ? 'Hide' : 'Show'}</span>
          </button>

          {validationExpanded && (
            <div className="rounded-lg border border-line bg-panel p-4">
              <ul className="space-y-1">
                {validationIssues.map((issue, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted">
                    <span className="text-cyan">•</span>
                    <span>
                      {issue.message}
                      {issue.location && <span className="text-xs text-faint"> ({issue.location})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <div className="rounded-lg border-l-4 border-brand border-line bg-panel p-4 text-center">
          <p className="text-cream">Loading leaderboard...</p>
        </div>
      )}

      {/* Jersey Cards */}
      {data && (
        <>
          {data.race_state.currentStageState === 'upcoming' && !data.race_state.currentStage ? (
            <div className="rounded-lg border-l-4 border-cyan border-line bg-panel p-6">
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
              <span className="h-[22px] w-1.5 rounded-sm bg-jersey-yellow" />
              <h2 className="font-display text-[28px] leading-none text-cream">General Classification</h2>
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
        <div className="rounded-lg border-l-4 border-faint border-line bg-panel p-4 text-center">
          <p className="text-muted">No riders found for {challenge}% challenge. Check your Google Sheet.</p>
        </div>
      )}
    </div>
  )
}
