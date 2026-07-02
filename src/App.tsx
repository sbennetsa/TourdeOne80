import { Leaderboard } from './pages/Leaderboard'
import './index.css'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Tour de ONE80</h1>
          <p className="text-gray-600">Live leaderboard & stats — 4–26 July 2026</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Leaderboard />
      </main>

      <footer className="border-t bg-gray-50 py-4 text-center text-sm text-gray-600">
        <p>
          M1 ✅ M2 ✅ M3 ✅ • Powered by React + Vite • Data from shared Google Sheet
        </p>
      </footer>
    </div>
  )
}
