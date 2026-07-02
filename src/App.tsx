import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Challenge } from './types'
import { Header } from './components/Header'
import { Landing } from './pages/Landing'
import { Leaderboard } from './pages/Leaderboard'
import { Stats } from './pages/Stats'
import { useLeaderboard } from './hooks'
import './index.css'

function LeaderboardApp() {
  const [challenge, setChallenge] = useState<Challenge>('20')
  const [currentPage, setCurrentPage] = useState<'leaderboard' | 'stats'>('leaderboard')
  const { data, error, isLoading, lastSynced, sync } = useLeaderboard(challenge)

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Top ribbon: 5 jersey color stripes */}
      <div className="flex h-[6px] w-full gap-0">
        <div className="flex-1 bg-jersey-yellow" />
        <div className="flex-1 bg-jersey-green" />
        <div className="flex-1 bg-jersey-polka" />
        <div className="flex-1 bg-jersey-white" />
        <div className="flex-1 bg-jersey-combative" />
      </div>

      <Header
        challenge={challenge}
        onChallengeChange={setChallenge}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        lastSynced={lastSynced}
        onRefresh={sync}
        isLoading={isLoading}
      />

      <main className="mx-auto max-w-[1180px] px-5 py-8">
        {currentPage === 'leaderboard' ? (
          <Leaderboard challenge={challenge} />
        ) : (
          data && <Stats gcEntries={data.gc_entries} raceState={data.race_state} totalStages={data.gc_entries[0]?.total_stages || 21} />
        )}

        {error && (
          <div className="mt-6 rounded-lg border-l-4 border-jersey-polka border-line bg-panel p-4">
            <p className="font-semibold text-cream">Error loading data</p>
            <p className="text-sm text-muted">{error}</p>
          </div>
        )}
      </main>

      <footer className="border-t border-line py-4 text-center text-xs font-label text-faint">
        <p>
          M1 ✅ M2 ✅ M3 ✅ M4 ✅ M5 🎨 • Tour de ONE80 Live Leaderboard & Stats
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/leaderboard" element={<LeaderboardApp />} />
    </Routes>
  )
}
