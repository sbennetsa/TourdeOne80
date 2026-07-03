import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLeaderboard } from '../hooks'

export function Landing() {
  const navigate = useNavigate()
  const { data: data20 } = useLeaderboard('20')
  const { data: data10 } = useLeaderboard('10')
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })

  useEffect(() => {
    const updateCountdown = () => {
      // Get current time and calculate next midnight in SAST (UTC+2)
      const now = new Date()
      // Convert current UTC time to SAST by adding 2 hours
      const nowSAST = new Date(now.getTime() + 2 * 60 * 60 * 1000)

      // Calculate next midnight SAST
      const nextMidnightSAST = new Date(nowSAST)
      nextMidnightSAST.setHours(24, 0, 0, 0) // Set to next midnight

      // Convert back to UTC for calculation
      const nextMidnightUTC = new Date(nextMidnightSAST.getTime() - 2 * 60 * 60 * 1000)
      const diff = nextMidnightUTC.getTime() - now.getTime()

      if (diff <= 0) {
        setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // Compute stats from data (combine both challenges)
  const allRiders = new Set<string>()
  if (data20?.gc_entries) {
    data20.gc_entries.forEach(e => allRiders.add(e.riderName))
  }
  if (data10?.gc_entries) {
    data10.gc_entries.forEach(e => allRiders.add(e.riderName))
  }

  const totalStages = data20?.gc_entries[0]?.total_stages || data10?.gc_entries[0]?.total_stages || 21
  const totalDays = 23 // Tour duration (fixed: 4-26 July = 23 days)
  const riderCount = allRiders.size || 0
  const jerseyCount = 5

  return (
    <div className="bg-ink text-cream flex flex-col min-h-screen">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 8%, rgba(53,200,240,0.10), transparent 55%)',
        }}
      />

      {/* Hero Section */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-10">
        <div className="mx-auto max-w-[1240px] text-center">
          {/* Kicker */}
          <p
            className="font-label text-[17px] font-semibold uppercase text-[#8b98c4] mb-2"
            style={{ letterSpacing: '9px', paddingLeft: '9px' }}
          >
            TOUR · DE
          </p>

          {/* Headline */}
          <h1 className="font-display leading-[0.74] tracking-[3px]" style={{ fontSize: 'clamp(72px, 22vw, 160px)' }}>
            <span className="text-cream">ONE</span><span className="text-cyan">80</span>
          </h1>

          {/* Cyan gradient rule */}
          <div
            className="mx-auto my-[26px] h-[3px]"
            style={{
              width: 'min(360px, 70%)',
              background: 'linear-gradient(90deg, transparent, #35c8f0, transparent)',
            }}
          />

          {/* Strapline */}
          <p className="font-label text-[14px] font-semibold uppercase tracking-[8px] text-faint">
            VIRTUAL GRAND TOUR · 2026
          </p>

          {/* Sub-copy */}
          <p className="mx-auto mt-6 max-w-[500px] font-body text-[16px] leading-[1.6] text-muted">
            21 stages. 23 days. One peloton of friends chasing the yellow jersey across a Zwift &
            TrainingPeaks grand tour.
          </p>

          {/* Countdown Timer */}
          <div className="mx-auto mt-10 rounded-xl border border-line bg-panel p-6">
            <p className="font-label text-xs font-bold uppercase tracking-[2px] text-faint mb-3">Tour Starts In</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-display text-[48px] leading-none text-cyan">{countdown.days}</span>
              <span className="font-display text-[40px] leading-none text-faint">:</span>
              <span className="font-display text-[48px] leading-none text-cyan">{countdown.hours}</span>
              <span className="font-display text-[40px] leading-none text-faint">:</span>
              <span className="font-display text-[48px] leading-none text-cyan">{countdown.minutes}</span>
              <span className="font-display text-[40px] leading-none text-faint">:</span>
              <span className="font-display text-[48px] leading-none text-cream">{countdown.seconds}</span>
            </div>
            <div className="mt-2 flex gap-8 justify-center text-center text-[9px] font-label uppercase text-faint">
              <span>Days</span>
              <span>Hours</span>
              <span>Minutes</span>
              <span>Seconds</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/leaderboard?c=20')}
            className="mt-8 rounded-full bg-brand px-7 py-3.5 font-label text-[13px] font-bold uppercase tracking-[1.5px] text-white transition-all hover:bg-blue-600"
          >
            Enter
          </button>
        </div>
      </div>

      {/* Stat Strip */}
      <div className="relative border-t border-b border-line bg-ink">
        <div className="mx-auto max-w-[1240px] px-10">
          <div className="grid grid-cols-4 w-full">
            {[
              { value: totalStages.toString(), label: 'Stages' },
              { value: totalDays.toString(), label: 'Days' },
              { value: riderCount.toString(), label: 'Riders' },
              { value: jerseyCount.toString(), label: 'Jerseys' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`border-r border-line py-6 px-4 text-center last:border-r-0`}
              >
                <p className="font-display text-[40px] text-cyan">{stat.value}</p>
                <p className="font-label text-[10px] font-bold uppercase tracking-[2px] text-faint">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
