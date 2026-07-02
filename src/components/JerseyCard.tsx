import React from 'react'
import { JerseyHolder, JerseyType } from '../types'

interface Props {
  type: JerseyType
  holder: JerseyHolder
}

const jerseyConfig: Record<JerseyType, { label: string; labelColor: string; crestBg: string; crestBorder?: boolean }> = {
  yellow: { label: 'Yellow · GC', labelColor: 'text-jersey-yellow', crestBg: 'bg-jersey-yellow' },
  green: { label: 'Green · Stages', labelColor: 'text-jersey-green', crestBg: 'bg-jersey-green' },
  polka: { label: 'Polka · KOM', labelColor: 'text-jersey-polka', crestBg: 'bg-white border-2 border-jersey-polka' },
  white: { label: 'White · Young', labelColor: 'text-jersey-white', crestBg: 'bg-jersey-white border-2 border-line' },
  combative: { label: 'Combative', labelColor: 'text-jersey-combativeText', crestBg: 'bg-jersey-combative' },
}

export function JerseyCard({ type, holder }: Props) {
  const config = jerseyConfig[type]
  const crestColor = type === 'polka' ? '#e2384f' : 'currentColor'

  // Yellow jersey gets special shadow
  const yellowShadow =
    type === 'yellow'
      ? 'shadow-[0_0_0_1px_rgba(242,194,0,0.08),0_14px_30px_-18px_rgba(242,194,0,0.4)]'
      : ''

  return (
    <div
      className={`rounded-xl border border-line bg-panel p-4 ${yellowShadow}`}
      style={{ borderTop: `5px solid ${type === 'yellow' ? '#F2C200' : type === 'green' ? '#23b061' : type === 'polka' ? '#e2384f' : type === 'white' ? '#e7ecfb' : '#8a2f3f'}` }}
    >
      <div className="space-y-2">
        {/* Jersey crest chip */}
        <div
          className={`h-[26px] w-[20px] rounded-[3px] ${config.crestBg}`}
          style={
            type === 'polka'
              ? {
                  backgroundImage:
                    'radial-gradient(circle at 25% 25%, #e2384f 2px, transparent 2px), radial-gradient(circle at 75% 75%, #e2384f 2px, transparent 2px), radial-gradient(circle at 50% 50%, #e2384f 2px, transparent 2px)',
                }
              : undefined
          }
        />

        {/* Label */}
        <p className={`font-label text-xs font-bold uppercase ${config.labelColor}`}>{config.label}</p>

        {/* Holder name or TBA */}
        {holder && holder.riderName ? (
          <>
            <p className="font-display text-[32px] leading-none text-cream">{holder.riderName}</p>
            <p className="font-body text-[13px] tabular-nums text-muted">{holder.value}</p>
            {holder.gap && <p className="text-xs text-faint">{holder.gap}</p>}
          </>
        ) : (
          <p className="text-sm italic text-faint">Awaiting Stage 1</p>
        )}
      </div>
    </div>
  )
}
