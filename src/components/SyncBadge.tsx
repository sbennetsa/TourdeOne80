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
    <div className="flex items-center gap-3 rounded-full border border-line bg-panel px-4 py-2">
      {/* Blinking green dot */}
      <span className={`inline-block h-2 w-2 rounded-full bg-jersey-green ${isLoading ? '' : 'animate-blink'}`} />

      {/* Status text */}
      <span className="font-label text-xs uppercase text-muted">
        Synced<span className="hidden sm:inline">: {formatTime(lastSynced)}</span>
      </span>

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="ml-2 rounded-full bg-brand px-3 py-1.5 font-label text-xs font-bold uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <span className={isLoading ? 'inline-block animate-spin-700' : ''}>↻</span>
      </button>
    </div>
  )
}
