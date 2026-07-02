import { useNavigate } from 'react-router-dom'
import { useLeaderboard } from '../hooks'

export function Landing() {
  const navigate = useNavigate()
  const { data: data20 } = useLeaderboard('20')
  const { data: data10 } = useLeaderboard('10')

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
    <div className="min-h-screen bg-ink text-cream">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 8%, rgba(53,200,240,0.10), transparent 55%)',
        }}
      />

      {/* Content */}
      <div className="relative px-10 py-[78px]">
        <div className="mx-auto max-w-[1240px] text-center">
          {/* Kicker */}
          <p
            className="font-label text-[17px] font-semibold uppercase text-[#8b98c4]"
            style={{ letterSpacing: '9px', paddingLeft: '9px' }}
          >
            TOUR · DE
          </p>

          {/* Headline */}
          <h1 className="font-display text-[160px] leading-[0.74] tracking-[3px]">
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

          {/* CTAs */}
          <div className="mt-8 flex gap-3 justify-center">
            <button
              onClick={() => navigate('/leaderboard?c=20')}
              className="rounded-full bg-brand px-7 py-3.5 font-label text-[13px] font-bold uppercase tracking-[1.5px] text-white transition-all hover:bg-blue-600"
            >
              Enter The Tour
            </button>
            <button
              onClick={() => navigate('/leaderboard?c=20')}
              className="rounded-full border border-[#2b376e] px-7 py-3.5 font-label text-[13px] font-bold uppercase tracking-[1.5px] text-cream transition-colors hover:border-cyan hover:text-cyan"
            >
              View Leaderboard
            </button>
          </div>
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
