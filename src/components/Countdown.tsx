/**
 * M3: Countdown timer
 * Live DD:HH:MM:SS ticker to next stage start
 */

import React, { useEffect, useState } from 'react'
import { Stage, RaceState, StageState } from '../types'
import { formatCountdown } from '../logic/scheduler'

interface Props {
  raceState: RaceState
}

export function Countdown({ raceState }: Props) {
  const [ticker, setTicker] = useState(raceState.countdown_seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatStageInfo = (): string => {
    if (!raceState.next_stage) return 'Tour finished'

    const stage = raceState.next_stage
    const dateStr = stage.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    return `Stage ${stage.number} • ${dateStr} • ${stage.profile}`
  }

  const formatRoute = (): string => {
    if (!raceState.next_stage) return ''
    const stage = raceState.next_stage
    return `${stage.target_km}km / ${stage.elevation_m}m`
  }

  const renderState = (): React.ReactNode => {
    if (raceState.currentStageState === 'finished') {
      return (
        <div className="text-center">
          <p className="text-4xl font-bold text-green-600">Tour Finished!</p>
          <p className="mt-2 text-lg text-gray-600">Final classification above</p>
        </div>
      )
    }

    return (
      <div className="text-center">
        <p className="mb-2 text-sm font-semibold text-gray-600 uppercase">Next stage in</p>
        <p className="font-mono text-5xl font-bold text-gray-900">{formatCountdown(ticker)}</p>
        <p className="mt-4 text-lg font-semibold text-gray-900">{formatStageInfo()}</p>
        <p className="mt-1 text-sm text-gray-600">{formatRoute()}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-md">
      {renderState()}
    </div>
  )
}
