import type { MatchEntry } from '@/types/tft'
import BarChart from '@/components/charts/BarChart'
import { ordinal, placementColor } from '@/lib/placement'

export default function PlacementDistribution({ matches }: { matches: MatchEntry[] }) {
    // tally how many times each placement 1..8 happened
    const counts = Array(8).fill(0) as number[]
    for (const m of matches) counts[m.placement - 1]++

    const bars = counts.map((c, i) => ({
        label: String(i + 1),
        value: c,
        color: placementColor(i + 1),
    }))

    return (
        <BarChart
            bars={bars}
            ariaLabel={`Placement distribution across ${matches.length} matches`}
            showValues
            tooltipLabel={i => `${ordinal(i + 1)} place`}
        />
    )
}
