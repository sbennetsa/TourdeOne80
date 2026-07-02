/**
 * M3: The Pen
 * While a stage is live, show riders yet to post a time (in the pen)
 * Riders move to result list as times arrive; left in pen at close = misses
 */

import React from 'react'
import { RiderEntry, Stage, RaceState } from '../types'

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
      <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">Pen closed (stage not live)</p>
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
    <div className="space-y-4">
      {/* The Pen */}
      <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">In the pen: {inPen.length} riders</h3>
          <span className="text-sm text-gray-600">Stage {currentStage.number} live</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {inPen.length === 0 ? (
            <p className="text-sm text-gray-600">All riders posted! 🎉</p>
          ) : (
            inPen.map(rider => (
              <span
                key={rider}
                className="inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow"
              >
                {rider}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Today's Results */}
      {results.length > 0 && (
        <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Today's results</h3>
          <div className="space-y-2">
            {results.map((entry, i) => (
              <div key={entry.riderName} className="flex items-center justify-between rounded bg-white p-2">
                <span className="font-semibold text-gray-900">
                  {i + 1}. {entry.riderName}
                </span>
                <span className="font-mono text-sm text-gray-700">
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
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${String(secs).padStart(2, '0')}`
}
