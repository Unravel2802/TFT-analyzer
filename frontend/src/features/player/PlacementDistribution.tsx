
import type { MatchEntry } from '@/types/tft'

export default function PlacementDistribution({ matches }: { matches: MatchEntry[] }) {
    // tally how many times each placement 1..8 happened
    const counts = Array(8).fill(0)
    for (const m of matches) counts[m.placement - 1]++

    const W = 320, H = 140, pad = 24
    const innerW = W - pad * 2
    const innerH = H - pad * 2

    const maxCount = Math.max(...counts, 1)   // avoid /0 if all zero
    const slot = innerW / 8                    // horizontal space per placement
    const barW = slot * 0.6

    return (
        <svg className='chart' viewBox={`0 0 ${W} ${H}`}>
            {counts.map((c, i) => {
                const h = (c / maxCount) * innerH        // height ∝ count
                const bx = pad + i * slot + (slot - barW) / 2
                const by = pad + innerH - h               // grow UP from baseline
                const placement = i + 1
                const color = placement === 1 ? 'var(--win)'
                            : placement <= 4 ? 'var(--top4)' : 'var(--bot4)'
                return (
                    <g key={i}>
                        <rect x={bx} y={by} width={barW} height={h} rx='2' fill={color} />
                        {c > 0 && (
                            <text x={bx + barW / 2} y={by - 4} textAnchor='middle'
                                  fontSize='9' fill='var(--text-bright)'>{c}</text>
                        )}
                        <text x={bx + barW / 2} y={H - pad + 12} textAnchor='middle'
                              fontSize='9' fill='var(--text-muted)'>{placement}</text>
                    </g>
                )
            })}
        </svg>
    )
}