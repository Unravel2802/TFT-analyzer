// Inverse of the backend's abs_lp (lp_utils.py):
// abs = tier_index * 400 + division_index * 100 + lp, Master+ starts at 2800.
const TIERS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master']
const TIER_SHORT = ['I', 'B', 'S', 'G', 'P', 'E', 'D', 'M']
const DIVISIONS = ['IV', 'III', 'II', 'I']
const MASTER_BASE = 2800

export function absLpToRank(abs: number): string {
    if (abs < 0) return `${abs} LP`
    if (abs >= MASTER_BASE) return `Master ${abs - MASTER_BASE} LP`
    const tier = Math.floor(abs / 400)
    const div = Math.floor((abs % 400) / 100)
    const lp = abs % 100
    return `${TIERS[tier]} ${DIVISIONS[div]} ${lp} LP`
}

// Short form for axis ticks ("G2" = Gold II, "M" = Master) — the full
// string doesn't fit in the chart's left gutter.
export function rankTickLabel(abs: number): string {
    if (abs < 0) return String(abs)
    if (abs >= MASTER_BASE) return abs === MASTER_BASE ? 'M' : `M+${abs - MASTER_BASE}`
    const tier = Math.floor(abs / 400)
    const div = Math.floor((abs % 400) / 100)
    return `${TIER_SHORT[tier]}${4 - div}` // division index 0 = IV
}

// Division boundaries (multiples of 100 abs LP) inside [lo, hi], thinned
// to at most `maxTicks` by stepping up to wider boundaries.
export function rankGridValues(lo: number, hi: number, maxTicks = 5): number[] {
    for (const step of [100, 200, 400, 800, 1600]) {
        const first = Math.ceil(lo / step) * step
        const ticks: number[] = []
        for (let v = first; v <= hi; v += step) ticks.push(v)
        if (ticks.length <= maxTicks) return ticks
    }
    return []
}
