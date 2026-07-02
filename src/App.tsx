import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Landing } from './pages/Landing'
import { Leaderboard } from './pages/Leaderboard'
import { Stats } from './pages/Stats'
import { useLeaderboard } from './hooks'
import './index.css'

function LeaderboardApp() {
  const [currentPage, setCurrentPage] = useState<'leaderboard' | 'stats'>('leaderboard')
  const { data: data10, lastSynced, sync, isLoading } = useLeaderboard('10')
  const { data: data20 } = useLeaderboard('20')

  // Combine entries from both challenges for stats
  const combinedEntries = [
    ...(data10?.gc_entries || []),
    ...(data20?.gc_entries || []),
  ]
  const raceState = data20?.race_state || data10?.race_state

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
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        lastSynced={lastSynced}
        onRefresh={sync}
        isLoading={isLoading}
      />

      <main className="mx-auto max-w-[1240px] px-5 py-8">
        {currentPage === 'leaderboard' ? (
          <Leaderboard />
        ) : (
          raceState && <Stats gcEntries={combinedEntries} raceState={raceState} totalStages={combinedEntries[0]?.total_stages || 21} />
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
