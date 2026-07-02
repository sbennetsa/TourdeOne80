/**
 * M3: Header component
 * Minimal app header (no duplication with page titles)
 */

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
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + nav */}
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Tour de ONE80</h1>
            <nav className="flex gap-4 border-l border-gray-200 pl-4">
              <button
                onClick={() => onPageChange('leaderboard')}
                className={`text-sm font-semibold transition-colors ${
                  currentPage === 'leaderboard'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => onPageChange('stats')}
                className={`text-sm font-semibold transition-colors ${
                  currentPage === 'stats' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Stats
              </button>
            </nav>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <ChallengeSwitcher selected={challenge} onChange={onChallengeChange} />
            <SyncBadge lastSynced={lastSynced} onRefresh={onRefresh} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </header>
  )
}
