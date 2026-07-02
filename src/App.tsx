import { useState } from 'react'
import { Challenge } from './types'

export default function App() {
  const [challenge, setChallenge] = useState<Challenge>('20')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Tour de ONE80</h1>
          <p className="text-gray-600">Live leaderboard & stats</p>
        </div>
      </header>

      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-4 py-4">
            <button
              onClick={() => setChallenge('20')}
              className={`px-4 py-2 font-semibold ${
                challenge === '20'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              20% Challenge
            </button>
            <button
              onClick={() => setChallenge('10')}
              className={`px-4 py-2 font-semibold ${
                challenge === '10'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              10% Challenge
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">
            M1 Scaffold in progress • Configure `src/config.ts` with Google Sheet URLs
          </p>
        </div>
      </main>
    </div>
  )
}
