import React, { useEffect, useState } from 'react'
import { RaceState } from '../types'

interface Props {
  raceState: RaceState
}

export function Countdown({ raceState }: Props) {
  const [ticker, setTicker] = useState(raceState.countdown_seconds)

  // Re-sync ticker whenever fresh race state arrives (60s data poll)
  useEffect(() => {
    setTicker(raceState.countdown_seconds)
  }, [raceState.countdown_seconds])

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDigits = (seconds: number): { days: string; hours: string; minutes: string; seconds: string } => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
    }
  }

  const digits = formatDigits(ticker)
  const stage = raceState.next_stage
  const isTourFinished = raceState.currentStageState === 'finished'
  const isPreTour = raceState.currentStageState === 'upcoming' && !raceState.currentStage

  const dateStr = stage?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || ''
  const kicker = isTourFinished ? 'TOUR FINISHED' : isPreTour ? 'TOUR STARTS IN' : 'NEXT STAGE IN'
  const stageInfo = isTourFinished ? '' : stage ? `Stage ${stage.number} · ${dateStr}` : ''
  const profile = stage?.profile || ''
  const routeInfo = stage ? `${stage.target_km}km · ${stage.elevation_m}m` : ''

  return (
    <div className="rounded-xl border-l-4 border-cyan bg-gradient-to-r from-panel2 to-panel p-4 md:p-6 shadow-lg">
      {/* Mobile: Stack layout */}
      <div className="md:hidden space-y-4">
        <div className="text-center">
          <p className="font-label text-xs font-bold uppercase text-faint">{kicker}</p>
          {stage && (
            <>
              <p className="font-display text-[20px] leading-none text-cream">{stageInfo}</p>
              <p className="mt-1 text-xs text-muted">
                {profile} • {routeInfo}
              </p>
            </>
          )}
        </div>

        {!isTourFinished && (
          <div className="flex flex-col justify-center items-center gap-0">
            <div className="flex items-baseline gap-0.5">
              <span className="font-display text-[32px] leading-none text-cyan">{digits.days}</span>
              <span className="font-display text-[28px] leading-none text-faint">:</span>
              <span className="font-display text-[32px] leading-none text-cyan">{digits.hours}</span>
              <span className="font-display text-[28px] leading-none text-faint">:</span>
              <span className="font-display text-[32px] leading-none text-cyan">{digits.minutes}</span>
              <span className="font-display text-[28px] leading-none text-faint">:</span>
              <span className="font-display text-[32px] leading-none text-cream">{digits.seconds}</span>
            </div>
            <div className="mt-1 flex gap-2 text-center text-[9px] font-label uppercase text-faint">
              <span>Days</span>
              <span>Hrs</span>
              <span>Min</span>
              <span>Sec</span>
            </div>
          </div>
        )}

        {stage && !isTourFinished && (
          <div className="text-center text-sm">
            <p className="font-label text-xs font-bold uppercase text-faint mb-1">Routes</p>
            <p className="text-[12px] font-bold text-cream">Zwift · {stage.zwift_route ?? '—'}</p>
            <p className="text-[12px] font-bold text-cream">TP · {stage.tp_route ?? '—'}</p>
          </div>
        )}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid grid-cols-3 items-center gap-4">
        {/* Left: Kicker + Stage Info */}
        <div className="flex flex-col justify-center text-left">
          <p className="font-label text-xs font-bold uppercase text-faint">{kicker}</p>
          {stage && (
            <>
              <p className="font-display text-[24px] leading-none text-cream">{stageInfo}</p>
              <p className="mt-1 text-xs text-muted">
                {profile} • {routeInfo}
              </p>
            </>
          )}
          {isTourFinished && <p className="font-display text-[24px] leading-none text-jersey-green">FINAL CLASS</p>}
        </div>

        {/* Center: Countdown Digits */}
        {!isTourFinished && (
          <div className="flex flex-col justify-center items-center gap-0">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[44px] leading-none text-cyan">{digits.days}</span>
              <span className="font-display text-[40px] leading-none text-faint">:</span>
              <span className="font-display text-[44px] leading-none text-cyan">{digits.hours}</span>
              <span className="font-display text-[40px] leading-none text-faint">:</span>
              <span className="font-display text-[44px] leading-none text-cyan">{digits.minutes}</span>
              <span className="font-display text-[40px] leading-none text-faint">:</span>
              <span className="font-display text-[44px] leading-none text-cream">{digits.seconds}</span>
            </div>
            <div className="mt-1 flex gap-[22px] text-center text-[9px] font-label uppercase text-faint">
              <span>Days</span>
              <span className="-ml-3">Hrs</span>
              <span className="-ml-3">Min</span>
              <span className="-ml-4">Sec</span>
            </div>
          </div>
        )}

        {/* Right: Routes (optional) */}
        {stage && !isTourFinished && (
          <div className="flex flex-col justify-center text-right">
            <p className="font-label text-xs font-bold uppercase text-faint">Routes</p>
            <p className="text-[13px] font-bold text-cream">Zwift · {stage.zwift_route ?? '—'}</p>
            <p className="text-[13px] font-bold text-cream">TP · {stage.tp_route ?? '—'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
