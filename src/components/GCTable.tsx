/**
 * M3: General Classification Table
 * Sortable leaderboard with rank, rider, time, gap, stages, elevation
 */

import React, { useState } from 'react'
import { GCEntry } from '../types'

interface Props {
  entries: GCEntry[]
}

type SortKey = 'rank' | 'time' | 'gap' | 'stages' | 'elevation'

export function GCTable({ entries }: Props) {
  const [sort, setSort] = useState<SortKey>('rank')

  const sorted = [...entries].sort((a, b) => {
    switch (sort) {
      case 'rank':
        return a.rank - b.rank
      case 'time':
        return a.total_time_seconds - b.total_time_seconds
      case 'gap':
        return a.gap_to_leader_seconds - b.gap_to_leader_seconds
      case 'stages':
        return b.stages_ridden - a.stages_ridden
      case 'elevation':
        return b.total_elevation_m - a.total_elevation_m
      default:
        return a.rank - b.rank
    }
  })

  const headers = [
    { key: 'rank' as const, label: 'Rank' },
    { key: 'time' as const, label: 'Time' },
    { key: 'gap' as const, label: 'Gap' },
    { key: 'stages' as const, label: 'Stages' },
    { key: 'elevation' as const, label: 'Elevation' },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="px-3 py-2 text-left font-semibold text-gray-900">Pos</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-900">Rider</th>
            {headers.map(h => (
              <th
                key={h.key}
                onClick={() => setSort(h.key)}
                className="cursor-pointer px-3 py-2 text-left font-semibold text-gray-900 hover:bg-gray-100"
              >
                {h.label} {sort === h.key ? '↓' : ''}
              </th>
            ))}
            <th className="px-3 py-2 text-left font-semibold text-gray-900">Team</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(entry => (
            <tr key={entry.riderName} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-3 py-2 font-semibold text-gray-900">{entry.rank}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{entry.riderName}</span>
                  {entry.is_disqualified && (
                    <span className="inline-block rounded bg-red-200 px-2 py-1 text-xs font-bold text-red-900">
                      DQ
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 font-mono text-gray-700">{formatTime(entry.total_time_seconds)}</td>
              <td className="px-3 py-2 font-mono text-gray-700">{entry.gap_display}</td>
              <td className="px-3 py-2 text-gray-700">{entry.stages_ridden}/{entry.total_stages}</td>
              <td className="px-3 py-2 text-gray-700">{Math.round(entry.total_elevation_m)}m</td>
              <td className="px-3 py-2 text-sm text-gray-500">{entry.team || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}
