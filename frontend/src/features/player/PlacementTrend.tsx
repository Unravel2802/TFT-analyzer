import type { MatchEntry } from '@/types/tft'
import { placementColor } from '@/lib/placement'

export default function PlacementTrend({ matches }: { matches: MatchEntry[] }) {
    // Riot returns newest-first; reverse so the line reads left→right = old→new
    const points = [...matches].reverse().map(m => m.placement)
    const n = points.length

    const W = 320, H = 140, pad = 24      // viewBox units, not pixels
    const innerW = W - pad * 2
    const innerH = H - pad * 2

    // map match index i → x coordinate (spread evenly across the width)
    const x = (i: number) =>
        n <= 1 ? pad + innerW / 2 : pad + (i / (n - 1)) * innerW

    // map placement p → y coordinate. 1 is best → top (small y); 8 → bottom
    const y = (p: number) => pad + ((p - 1) / (8 - 1)) * innerH

    const line = points.map((p, i) => `${x(i)},${y(p)}`).join(' ')

    return (
        <svg className='chart' viewBox={`0 0 ${W} ${H}`}>
            {[1, 4, 8].map(p => (
                <g key={p}>
                    <line x1={pad} y1={y(p)} x2={W - pad} y2={y(p)}
                          stroke='var(--border)' strokeWidth='1' />
                    <text x={pad - 6} y={y(p) + 3} textAnchor='end'
                          fontSize='9' fill='var(--text-muted)'>{p}</text>
                </g>
            ))}
            <polyline points={line} fill='none' stroke='var(--gold)'
                      strokeWidth='2' strokeLinejoin='round' strokeLinecap='round' />
            {points.map((p, i) => (
                <circle key={i} cx={x(i)} cy={y(p)} r='3' fill={placementColor(p)} />
            ))}
        </svg>
    )
}