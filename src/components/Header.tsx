import { Challenge } from '../types'
import { ChallengeSwitcher } from './ChallengeSwitcher'
import { SyncBadge } from './SyncBadge'

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
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(9,16,42,0.92)] backdrop-blur-sm">
      <div className="mx-auto max-w-[1180px] px-5 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Wordmark + subtitle */}
          <div className="flex flex-col">
            <h1 className="font-display text-[34px] leading-none">
              TOUR DE <span className="text-cyan">ONE80</span>
            </h1>
            <p className="font-label text-xs uppercase tracking-wider text-muted">
              Live Leaderboard & Stats • 4–26 Jul 2026
            </p>
          </div>

          {/* Nav pills */}
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

          {/* Controls */}
          <div className="flex items-center gap-3">
            <ChallengeSwitcher selected={challenge} onChange={onChallengeChange} />
            <SyncBadge lastSynced={lastSynced} onRefresh={onRefresh} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </header>
  )
}
