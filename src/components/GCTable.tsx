import React, { useState } from 'react'
import { GCEntry, JerseyType, JerseyHolder } from '../types'

interface Props {
  entries: GCEntry[]
  jerseys?: Record<JerseyType, JerseyHolder>
}

type SortKey = 'rank' | 'time' | 'gap' | 'stages' | 'elevation'

export function GCTable({ entries, jerseys }: Props) {
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

  // Jersey dots: which jerseys does each rider hold?
  const getRiderJerseys = (riderName: string): JerseyType[] => {
    if (!jerseys) return []
    return (['yellow', 'green', 'polka', 'white', 'combative'] as const).filter(
      type => jerseys[type]?.riderName === riderName
    )
  }

  const jerseyColors: Record<JerseyType, string> = {
    yellow: '#F2C200',
    green: '#23b061',
    polka: '#e2384f',
    white: '#e7ecfb',
    combative: '#8a2f3f',
  }

  const getMissColor = (misses: number): string => {
    if (misses === 0) return 'text-muted'
    if (misses <= 2) return 'text-jersey-yellow'
    return 'text-jersey-polka'
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-line bg-panel2">
            <th className="px-3 py-2 font-label text-[10.5px] font-bold uppercase text-faint">Pos</th>
            <th className="px-3 py-2 font-label text-[10.5px] font-bold uppercase text-faint text-left">Rider</th>
            <th className="cursor-pointer px-3 py-2 font-label text-[10.5px] font-bold uppercase text-faint" onClick={() => setSort('time')}>
              Time {sort === 'time' ? '↓' : ''}
            </th>
            <th className="cursor-pointer px-3 py-2 font-label text-[10.5px] font-bold uppercase text-faint" onClick={() => setSort('gap')}>
              Gap {sort === 'gap' ? '↓' : ''}
            </th>
            <th className="cursor-pointer px-3 py-2 font-label text-[10.5px] font-bold uppercase text-faint" onClick={() => setSort('stages')}>
              Stages {sort === 'stages' ? '↓' : ''}
            </th>
            <th className="px-3 py-2 font-label text-[10.5px] font-bold uppercase text-faint">Miss</th>
            <th className="cursor-pointer px-3 py-2 font-label text-[10.5px] font-bold uppercase text-faint text-right" onClick={() => setSort('elevation')}>
              Elev {sort === 'elevation' ? '↓' : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(entry => {
            const isLeader = entry.rank === 1 && !entry.is_disqualified
            const riderJerseys = getRiderJerseys(entry.riderName)

            return (
              <tr
                key={entry.riderName}
                className={`border-b border-white/[0.045] hover:bg-white/[0.03] ${
                  isLeader ? 'border-l-[3px] border-l-jersey-yellow bg-jersey-yellow/[0.06]' : ''
                }`}
              >
                <td className={`px-3 py-2 font-display text-[22px] ${isLeader ? 'text-jersey-yellow' : 'text-faint'}`}>
                  {entry.rank}
                </td>
                <td className="px-3 py-2 text-left">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-body font-bold ${isLeader ? 'text-jersey-yellow' : 'text-cream'}`}>
                        {entry.riderName}
                      </span>
                      {/* Jersey dots: 9×12px, 2px radius */}
                      {riderJerseys.map(type => (
                        <div
                          key={type}
                          className="inline-block h-[12px] w-[9px] rounded-[2px]"
                          style={{ backgroundColor: jerseyColors[type] }}
                          title={type}
                        />
                      ))}
                      {/* DQ badge */}
                      {entry.is_disqualified && (
                        <span className="inline-block rounded-full border border-jersey-polka px-1.5 py-0.5 font-label text-[9px] font-bold uppercase text-jersey-polka">
                          DQ
                        </span>
                      )}
                    </div>
                    {entry.team && <p className="text-xs text-faint">{entry.team}</p>}
                  </div>
                </td>
                <td className={`px-3 py-2 font-body font-bold tabular-nums ${isLeader ? 'text-jersey-yellow' : 'text-cream'}`}>
                  {formatTime(entry.total_time_seconds)}
                </td>
                <td className="px-3 py-2 font-body text-sm tabular-nums text-muted">{entry.gap_display}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-cream tabular-nums">
                      {entry.stages_ridden}/{entry.total_stages}
                    </span>
                    <div className="h-1 w-16 rounded bg-white/[0.08]">
                      <div
                        className="h-full bg-jersey-green"
                        style={{ width: `${(entry.stages_ridden / entry.total_stages) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className={`px-3 py-2 text-center text-sm font-bold tabular-nums ${getMissColor(entry.stages_missed)}`}>
                  {entry.stages_missed}
                </td>
                <td className="px-3 py-2 text-right font-body text-sm tabular-nums text-muted">
                  {Math.round(entry.total_elevation_m)}m
                </td>
              </tr>
            )
          })}
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
