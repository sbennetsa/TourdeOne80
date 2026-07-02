/**
 * M3: Challenge Switcher
 * Toggle between 10% and 20% challenges
 * Persists in URL as ?c=10 or ?c=20
 */

import React, { useEffect } from 'react'

interface Props {
  selected: '10' | '20'
  onChange: (challenge: '10' | '20') => void
}

export function ChallengeSwitcher({ selected, onChange }: Props) {
  useEffect(() => {
    // Load from URL on mount
    const params = new URLSearchParams(window.location.search)
    const challenge = params.get('c') as '10' | '20' | null
    if (challenge && ['10', '20'].includes(challenge)) {
      onChange(challenge)
    }
  }, [])

  const handleChange = (c: '10' | '20') => {
    onChange(c)
    // Update URL
    const params = new URLSearchParams(window.location.search)
    params.set('c', c)
    window.history.replaceState(null, '', `?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 rounded-lg border border-gray-300 bg-white p-1">
      {(['10', '20'] as const).map(c => (
        <button
          key={c}
          onClick={() => handleChange(c)}
          className={`rounded px-4 py-2 font-semibold transition-colors ${
            selected === c
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {c}% Challenge
        </button>
      ))}
    </div>
  )
}
