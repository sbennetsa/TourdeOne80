import React from 'react'

interface Props {
  lastSynced: Date
  onRefresh: () => void
  isLoading?: boolean
}

export function SyncBadge({ lastSynced, onRefresh, isLoading = false }: Props) {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-1 md:gap-3 rounded-full border border-line bg-panel px-2 md:px-4 py-1.5 md:py-2">
      {/* Blinking green dot */}
      <span className={`inline-block h-2 w-2 rounded-full bg-jersey-green ${isLoading ? '' : 'animate-blink'}`} />

      {/* Status text - hidden on mobile */}
      <span className="hidden md:inline font-label text-xs uppercase text-muted">
        Synced: {formatTime(lastSynced)}
      </span>

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="rounded-full bg-brand px-2 md:px-3 py-1 md:py-1.5 font-label text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <span className={isLoading ? 'inline-block animate-spin-700' : ''}>↻</span>
      </button>
    </div>
  )
}
