import { GCEntry, RaceState } from '../types'

interface Props {
  gcEntries: GCEntry[]
  raceState: RaceState
  totalStages: number
}

export function Stats({ gcEntries, raceState, totalStages }: Props) {
  const stagesCompleted = raceState.closed_stages.length
  const riderCount = gcEntries.length
  const totalFieldDistance = gcEntries.reduce((sum, entry) => {
    return sum + (entry.total_elevation_m / 1000) * 50
  }, 0)
  const totalElevationGained = gcEntries.reduce((sum, entry) => {
    return sum + entry.total_elevation_m
  }, 0)
  const everestEquivalent = totalElevationGained / 8848

  if (riderCount === 0) {
    return (
      <div className="rounded-lg border-l-4 border-cyan border-line bg-panel p-6 text-center">
        <p className="text-lg font-semibold text-cream">No riders yet</p>
        <p className="mt-2 text-sm text-muted">Check back when riders join the challenge.</p>
      </div>
    )
  }

  const statTiles = [
    { label: 'Stages Done', value: `${stagesCompleted}/${totalStages}`, color: 'text-cyan' },
    { label: 'Active Riders', value: riderCount.toString(), color: 'text-jersey-green' },
    { label: 'Total Distance', value: `${Math.round(totalFieldDistance)}km`, color: 'text-cream' },
    { label: 'Everests', value: everestEquivalent.toFixed(1) + '×', color: 'text-jersey-polka' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Tiles Banner */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {statTiles.map((tile, i) => (
          <div key={i} className="rounded-xl border border-line bg-panel p-4">
            <p className="font-label text-[10.5px] font-bold uppercase text-faint">{tile.label}</p>
            <p className={`mt-2 font-display text-[38px] leading-none ${tile.color}`}>{tile.value}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="space-y-2 rounded-xl border border-line bg-panel p-6">
        <h2 className="font-display text-[22px] leading-none text-cream">Completion Heatmap</h2>
        <Heatmap gcEntries={gcEntries} totalStages={totalStages} />
      </div>

      {/* Progress Bars */}
      <div className="space-y-2 rounded-xl border border-line bg-panel p-6">
        <h2 className="font-display text-[22px] leading-none text-cream">Rider Progress</h2>
        <ProgressBars gcEntries={gcEntries} />
      </div>
    </div>
  )
}

function Heatmap({ gcEntries, totalStages }: { gcEntries: GCEntry[]; totalStages: number }) {
  if (totalStages === 0) {
    return <p className="text-muted">No stages scheduled yet</p>
  }

  return (
    <div className="space-y-1 pt-2">
      {gcEntries.slice(0, 20).map(entry => (
        <div key={entry.riderName} className="flex items-center gap-3">
          <span className="w-28 truncate text-sm font-body font-bold text-cream">{entry.riderName}</span>
          <div className="flex-1">
            <div className="h-5 rounded bg-white/[0.07]">
              <div
                className="h-full rounded bg-gradient-to-r from-jersey-green to-[#3fd07f]"
                style={{ width: `${(entry.stages_ridden / totalStages) * 100}%` }}
              />
            </div>
            <p className="mt-0.5 text-xs text-faint">
              {entry.stages_ridden}/{totalStages} ({Math.round((entry.stages_ridden / totalStages) * 100)}%)
            </p>
          </div>
        </div>
      ))}
      {gcEntries.length > 20 && (
        <p className="pt-1 text-xs text-faint">+{gcEntries.length - 20} more riders...</p>
      )}
    </div>
  )
}

function ProgressBars({ gcEntries }: { gcEntries: GCEntry[] }) {
  const maxElevation = Math.max(...gcEntries.map(e => e.total_elevation_m), 1)

  return (
    <div className="space-y-3 pt-2">
      {gcEntries.slice(0, 20).map(entry => (
        <div key={entry.riderName}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-body font-bold text-cream">{entry.riderName}</span>
            <span className="font-body text-xs tabular-nums text-faint">
              {Math.round(entry.total_elevation_m)}m
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-jersey-green to-[#3fd07f]"
              style={{
                width: `${maxElevation > 0 ? (entry.total_elevation_m / maxElevation) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ))}
      {gcEntries.length > 20 && (
        <p className="pt-1 text-xs text-faint">+{gcEntries.length - 20} more riders...</p>
      )}
    </div>
  )
}
