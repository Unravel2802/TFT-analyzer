import type { MatchEntry } from '@/types/tft'
import LineChart from '@/components/charts/LineChart'
import { ordinal, placementColor } from '@/lib/placement'

export default function PlacementTrend({ matches }: { matches: MatchEntry[] }) {
    // Riot returns newest-first; reverse so the line reads left→right = old→new
    const points = [...matches].reverse().map(m => m.placement)

    return (
        <LineChart
            values={points}
            ariaLabel={`Placement trend over the last ${points.length} matches`}
            yDomain={[1, 8]}
            invertY
            gridValues={[1, 4, 8]}
            formatValue={p => ordinal(p)}
            formatTick={String}
            xLabel={i => `Game ${i + 1} of ${points.length}`}
            dotColor={placementColor}
        />
    )
}
