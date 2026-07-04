import React from 'react'
import { RiderEntry, RaceState } from '../types'

interface Props {
  raceState: RaceState
  allRiders: string[]
  stageEntries: RiderEntry[]
}

export function Pen({ raceState, allRiders, stageEntries }: Props) {
  const currentStage = raceState.currentStage
  const isLive = raceState.currentStageState === 'live'

  if (!isLive || !currentStage) {
    return (
      <div className="rounded-lg border border-line border-l-4 border-l-white/20 bg-panel p-4">
        <p className="text-sm text-faint">Pen closed (stage not live)</p>
      </div>
    )
  }

  // Riders who have posted a time for this stage
  const posted = new Set(
    stageEntries
      .filter(e => e.stageNumber === currentStage.number && e.time_seconds !== undefined && e.is_valid)
      .map(e => e.riderName)
  )

  // Riders still in the pen (no time yet)
  const inPen = allRiders.filter(r => !posted.has(r))

  // Today's results (riders who have posted)
  const results = stageEntries
    .filter(e => e.stageNumber === currentStage.number && e.time_seconds !== undefined && e.is_valid)
    .sort((a, b) => (a.time_seconds || 0) - (b.time_seconds || 0))

  return (
    <div className="space-y-3">
      {/* The Pen */}
      <div className="rounded-lg border-2 border-jersey-yellow/40 bg-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-label text-sm font-bold uppercase text-cream">In the pen: {inPen.length} riders</h3>
          <span className="font-label text-xs font-bold uppercase text-faint">Stage {currentStage.number} live</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {inPen.length === 0 ? (
            <p className="text-sm text-jersey-green">All riders posted! 🎉</p>
          ) : (
            inPen.map(rider => (
              <span
                key={rider}
                className="inline-block rounded-full bg-panel2 px-3 py-1 font-label text-xs font-bold uppercase text-cream"
              >
                {rider}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Today's Results */}
      {results.length > 0 && (
        <div className="rounded-lg border border-line bg-panel2 p-4">
          <h3 className="mb-3 font-label text-sm font-bold uppercase text-cream">Today's results</h3>
          <div className="space-y-2">
            {results.map((entry, i) => (
              <div key={entry.riderName} className="flex items-center justify-between rounded px-2 py-1">
                <span className="font-label text-sm font-bold text-cream">
                  {i + 1}. {entry.riderName}
                </span>
                <span className="font-label text-xs tabular-nums text-muted">
                  {formatTime(entry.time_seconds || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}
