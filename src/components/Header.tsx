import { useNavigate } from 'react-router-dom'
import { Challenge } from '../types'
import { ChallengeSwitcher } from './ChallengeSwitcher'
import { SyncBadge } from './SyncBadge'
import { WheelLogo } from './WheelLogo'

interface Props {
  challenge: Challenge
  onChallengeChange: (c: Challenge) => void
  currentPage: 'leaderboard' | 'stats'
  onPageChange: (page: 'leaderboard' | 'stats') => void
  lastSynced: Date
  onRefresh: () => void
  isLoading?: boolean
}

export function Header({
  challenge,
  onChallengeChange,
  currentPage,
  onPageChange,
  lastSynced,
  onRefresh,
  isLoading,
}: Props) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(9,16,42,0.92)] backdrop-blur-sm">
      <div className="mx-auto max-w-[1240px] px-10 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Logo + Wordmark */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <WheelLogo />
            <div className="flex flex-col text-left">
              <p className="font-label text-[9px] font-semibold uppercase tracking-[4px] text-muted">
                Tour De
              </p>
              <h1 className="font-display text-[30px] leading-none">
                <span className="text-cream">ONE</span><span className="text-cyan">80</span>
              </h1>
            </div>
          </button>

          {/* Center: Page nav */}
          <nav className="flex gap-2 rounded-full bg-panel p-1">
            <button
              onClick={() => onPageChange('leaderboard')}
              className={`rounded-full px-4 py-2 font-label text-xs font-bold uppercase transition-colors ${
                currentPage === 'leaderboard'
                  ? 'bg-brand text-white'
                  : 'text-muted hover:text-cream'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => onPageChange('stats')}
              className={`rounded-full px-4 py-2 font-label text-xs font-bold uppercase transition-colors ${
                currentPage === 'stats'
                  ? 'bg-brand text-white'
                  : 'text-muted hover:text-cream'
              }`}
            >
              Stats
            </button>
          </nav>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            <ChallengeSwitcher selected={challenge} onChange={onChallengeChange} />
            <SyncBadge lastSynced={lastSynced} onRefresh={onRefresh} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </header>
  )
}
