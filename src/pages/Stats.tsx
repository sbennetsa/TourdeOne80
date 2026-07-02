/**
 * M4: Stats page
 * Heatmap, progress banner, progress bars
 */

import { GCEntry, RaceState } from '../types'

interface Props {
  gcEntries: GCEntry[]
  raceState: RaceState
  totalStages: number
}

export function Stats({ gcEntries, raceState, totalStages }: Props) {
  const stagesCompleted = raceState.closed_stages.length
  const riderCount = gcEntries.length

  // Calculate total field distance
  const totalFieldDistance = gcEntries.reduce((sum, entry) => {
    return sum + (entry.total_elevation_m / 1000) * 50 // Rough approximation: 50km per 1000m
  }, 0)

  // Everest equivalent (1 Everest = 8848m)
  const everestEquivalent = gcEntries.reduce((sum, entry) => {
    return sum + entry.total_elevation_m
  }, 0) / 8848

  return (
    <div className="space-y-6">
      {/* Progress Banner */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Stages Done" value={`${stagesCompleted}/${totalStages}`} color="blue" />
        <StatCard label="Active Riders" value={riderCount.toString()} color="green" />
        <StatCard
          label="Total Distance"
          value={`${Math.round(totalFieldDistance)}km`}
          color="purple"
        />
        <StatCard
          label="Everests Climbed"
          value={everestEquivalent.toFixed(1)}
          color="red"
        />
      </div>

      {/* Completion Heatmap (TODO: implement with Recharts) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Completion Heatmap</h2>
        <Heatmap gcEntries={gcEntries} totalStages={totalStages} />
      </div>

      {/* Per-rider Progress Bars (TODO: implement) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Rider Progress</h2>
        <ProgressBars gcEntries={gcEntries} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: 'blue' | 'green' | 'purple' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${colors[color]}`}>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Heatmap({ gcEntries, totalStages }: { gcEntries: GCEntry[]; totalStages: number }) {
  // TODO: Build heatmap with Recharts
  // For now, show placeholder

  return (
    <div className="space-y-2">
      {gcEntries.slice(0, 10).map(entry => (
        <div key={entry.riderName} className="flex items-center gap-3">
          <span className="w-32 truncate font-semibold text-gray-700">{entry.riderName}</span>
          <div className="flex-1 space-y-1">
            <div className="h-6 rounded bg-gray-100">
              <div
                className="h-full rounded bg-gradient-to-r from-blue-400 to-blue-600"
                style={{
                  width: `${(entry.stages_ridden / totalStages) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {entry.stages_ridden}/{totalStages} stages ({Math.round((entry.stages_ridden / totalStages) * 100)}%)
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProgressBars({ gcEntries }: { gcEntries: GCEntry[] }) {
  const maxElevation = Math.max(...gcEntries.map(e => e.total_elevation_m))

  return (
    <div className="space-y-4">
      {gcEntries.slice(0, 10).map(entry => (
        <div key={entry.riderName}>
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-semibold text-gray-700">{entry.riderName}</span>
            <span className="text-xs text-gray-500">
              {Math.round(entry.total_elevation_m)}m / {Math.round(maxElevation)}m
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
              style={{
                width: `${(entry.total_elevation_m / maxElevation) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
