/**
 * M3: Sync Badge
 * Shows last synced time + manual refresh button
 */

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
      second: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
      <span className="text-sm text-gray-600">
        Last synced: <span className="font-mono font-semibold text-gray-900">{formatTime(lastSynced)}</span>
      </span>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="rounded bg-blue-500 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  )
}
