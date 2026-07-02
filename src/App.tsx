import { useState } from 'react'
import { Challenge } from './types'
import { Header } from './components/Header'
import { Leaderboard } from './pages/Leaderboard'
import { Stats } from './pages/Stats'
import { useLeaderboard } from './hooks'
import './index.css'

export default function App() {
  const [challenge, setChallenge] = useState<Challenge>('20')
  const [currentPage, setCurrentPage] = useState<'leaderboard' | 'stats'>('leaderboard')
  const { data, error, isLoading, lastSynced, sync } = useLeaderboard(challenge)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        challenge={challenge}
        onChallengeChange={setChallenge}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        lastSynced={lastSynced}
        onRefresh={sync}
        isLoading={isLoading}
      />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {currentPage === 'leaderboard' ? (
          <Leaderboard challenge={challenge} />
        ) : (
          data && <Stats gcEntries={data.gc_entries} raceState={data.race_state} totalStages={data.gc_entries[0]?.total_stages || 21} />
        )}

        {error && (
          <div className="mt-6 rounded-lg border-2 border-red-300 bg-red-50 p-4">
            <p className="font-semibold text-red-900">Error loading data</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </main>

      <footer className="border-t bg-gray-50 py-4 text-center text-sm text-gray-600">
        <p>
          M1 ✅ M2 ✅ M3 ✅ M4 ✅ • Powered by React + Vite • Data from shared Google Sheet
        </p>
      </footer>
    </div>
  )
}
