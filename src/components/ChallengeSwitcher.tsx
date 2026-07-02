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
    <div className="flex gap-1 rounded-full border border-line bg-panel p-1">
      {(['10', '20'] as const).map(c => (
        <button
          key={c}
          onClick={() => handleChange(c)}
          className={`rounded-full px-3 py-1.5 font-label text-xs font-bold uppercase transition-colors ${
            selected === c
              ? 'bg-brand text-white'
              : 'text-muted hover:text-cream'
          }`}
        >
          {c}%
        </button>
      ))}
    </div>
  )
}
