/**
 * M3: Jersey Card component
 * Displays jersey holder with their key stat (time, stages, elevation, etc.)
 */

import React from 'react'
import { JerseyHolder, JerseyType } from '../types'

interface Props {
  type: JerseyType
  holder: JerseyHolder
}

const jerseyConfig: Record<JerseyType, { label: string; emoji: string; color: string }> = {
  yellow: { label: 'General Classification', emoji: '🟡', color: 'bg-yellow-50 border-yellow-300' },
  green: { label: 'Stages', emoji: '🟢', color: 'bg-green-50 border-green-300' },
  polka: { label: 'King of the Mountains', emoji: '🔴', color: 'bg-red-50 border-red-300' },
  white: { label: 'Best Young Rider', emoji: '⚪', color: 'bg-white border-gray-300' },
  combative: { label: 'Most Combative', emoji: '🏆', color: 'bg-purple-50 border-purple-300' },
}

export function JerseyCard({ type, holder }: Props) {
  const config = jerseyConfig[type]

  return (
    <div className={`rounded-lg border-2 p-4 shadow-md ${config.color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600">{config.emoji} {config.label}</p>
          <p className="text-2xl font-bold text-gray-900">{holder.riderName}</p>
          <p className="text-lg text-gray-700">{holder.value}</p>
          {holder.gap && <p className="text-sm text-gray-500">{holder.gap}</p>}
        </div>
      </div>
    </div>
  )
}
