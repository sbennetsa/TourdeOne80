import { JerseyCard } from '../components/JerseyCard'
import { GCTable } from '../components/GCTable'
import { Countdown } from '../components/Countdown'
import { Pen } from '../components/Pen'
import { useLeaderboard } from '../hooks'

export function Leaderboard() {
  const { data: data10, error: error10, isLoading: isLoading10 } = useLeaderboard('10')
  const { data: data20, error: error20, isLoading: isLoading20 } = useLeaderboard('20')

  const loading = isLoading10 || isLoading20
  const error = error10 || error20

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
      {loading && !data10 && !data20 && (
        <div className="rounded-lg border border-line border-l-4 border-l-jersey-yellow bg-panel p-4 text-center">
          <p className="text-cream">Loading leaderboard...</p>
        </div>
      )}

      {/* Jersey Cards - shared across both challenges */}
      {(data10 || data20) && (
        <>
          {(data10?.race_state.currentStageState === 'upcoming' && !data10?.race_state.currentStage) ? (
            <div className="rounded-lg border border-line border-l-4 border-l-cyan bg-panel p-6">
              <p className="text-center text-lg font-semibold text-muted">
                Tour hasn't started yet. Check back at the opening ceremony!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <JerseyCard type="yellow" holder={data20?.jerseys.yellow} />
              <JerseyCard type="green" holder={data20?.jerseys.green} />
              <JerseyCard type="polka" holder={data20?.jerseys.polka} />
              <JerseyCard type="white" holder={data20?.jerseys.white} />
              <JerseyCard type="combative" holder={data20?.jerseys.combative} />
            </div>
          )}

          {/* Race-day panel: Countdown + Pen */}
          {data20 && <Countdown raceState={data20.race_state} />}

          {/* The Pen (riders in the pen, today's results) */}
          {data20 && data20.race_state.currentStageState === 'live' && (
            <Pen
              raceState={data20.race_state}
              allRiders={data20.gc_entries.map(e => e.riderName)}
              stageEntries={[]}
            />
          )}

          {/* Side-by-side GC Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 10% Challenge */}
            {data10 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-[28px] w-1 bg-jersey-yellow" />
                  <h2 className="font-display text-[28px] leading-tight text-cream">10% Challenge</h2>
                </div>

                {data10.race_state.closed_stages.length === 0 && data10.race_state.currentStageState === 'upcoming' ? (
                  <p className="text-muted">Standings will appear after the first stage closes.</p>
                ) : (
                  <GCTable entries={data10.gc_entries} jerseys={data10.jerseys} />
                )}

                {data10.gc_entries.length === 0 && (
                  <div className="rounded-lg border border-line border-l-4 border-l-white/20 bg-panel p-4 text-center">
                    <p className="text-muted">No riders in 10% challenge.</p>
                  </div>
                )}
              </div>
            )}

            {/* 20% Challenge */}
            {data20 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-[28px] w-1 bg-jersey-yellow" />
                  <h2 className="font-display text-[28px] leading-tight text-cream">20% Challenge</h2>
                </div>

                {data20.race_state.closed_stages.length === 0 && data20.race_state.currentStageState === 'upcoming' ? (
                  <p className="text-muted">Standings will appear after the first stage closes.</p>
                ) : (
                  <GCTable entries={data20.gc_entries} jerseys={data20.jerseys} />
                )}

                {data20.gc_entries.length === 0 && (
                  <div className="rounded-lg border border-line border-l-4 border-l-white/20 bg-panel p-4 text-center">
                    <p className="text-muted">No riders in 20% challenge.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
