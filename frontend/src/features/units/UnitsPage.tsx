import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getUnitsMeta, getMyUnits } from './api'
import type { UnitStat } from '@/types/tft'
import UnitPortrait from '@/components/UnitPortrait'
import TableSkeleton from '@/components/TableSkeleton'

type SortKey = 'play_rate' | 'avg_placement' | 'top4_rate' | 'games'

const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'play_rate', label: 'Play rate' },
    { key: 'avg_placement', label: 'Avg placement' },
    { key: 'top4_rate', label: 'Top 4 rate' },
    { key: 'games', label: 'Games' },
]

// lower avg placement is better, so that column defaults ascending
function defaultAsc(key: SortKey): boolean {
    return key === 'avg_placement'
}

// Your own numbers on a unit, next to the meta's. Green when you place better
// than the ladder average on it, red when worse (0.15 dead zone so a coin-flip
// difference isn't painted as a verdict).
function YourAvgCell({ mine, metaAvg }: { mine: UnitStat | undefined; metaAvg: number }) {
    if (!mine) return <td className='num unit-mine-empty'>—</td>
    const diff = mine.avg_placement - metaAvg
    const tone = diff <= -0.15 ? ' unit-mine-good' : diff >= 0.15 ? ' unit-mine-bad' : ''
    return (
        <td className={`num unit-mine${tone}`} title={`Your ${mine.avg_placement.toFixed(2)} vs meta ${metaAvg.toFixed(2)} over ${mine.games} of your games`}>
            {mine.avg_placement.toFixed(2)}
            <span className='unit-mine-games'>{mine.games}g</span>
        </td>
    )
}

export default function UnitsPage() {
    const { token } = useAuth()
    const [units, setUnits] = useState<UnitStat[]>([])
    const [mine, setMine] = useState<Map<string, UnitStat> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortKey, setSortKey] = useState<SortKey>('avg_placement')
    const [asc, setAsc] = useState(defaultAsc('avg_placement'))

    useEffect(() => {
        let active = true
        getUnitsMeta()
            .then(data => { if (active) setUnits(data) })
            .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Failed to load') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    // Personal column is additive: fetched only when signed in, and any failure
    // (rate limit, no games) just leaves the table global — never an error state.
    useEffect(() => {
        if (!token) return
        let active = true
        getMyUnits(token)
            .then(data => { if (active) setMine(new Map(data.map(u => [u.unit_id, u]))) })
            .catch(() => { /* column simply doesn't render */ })
        return () => { active = false }
    }, [token])

    function toggleSort(key: SortKey) {
        if (key === sortKey) {
            setAsc(a => !a)
        } else {
            setSortKey(key)
            setAsc(defaultAsc(key))
        }
    }

    const sorted = [...units].sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]))
    // token gate means a signed-out visitor never sees the column, even with stale state
    const showMine = !!token && mine !== null && mine.size > 0

    if (error) return (
        <div className='page'>
            <div className='error-box'><p className='error-text'>{error}</p></div>
        </div>
    )

    return (
        <div className='page'>
            <h1 className='page-title'>Units</h1>
            <p className='page-tagline'>Per-unit performance across recent Challenger/Master games.</p>

            {loading ? <TableSkeleton rows={10} cols={5} /> : (
                <table className='meta-table'>
                    <thead>
                        <tr>
                            <th>Unit</th>
                            {COLUMNS.map(col => (
                                <th
                                    key={col.key}
                                    className='num'
                                    aria-sort={sortKey === col.key ? (asc ? 'ascending' : 'descending') : undefined}
                                >
                                    <button className='th-sort' onClick={() => toggleSort(col.key)}>
                                        {col.label}
                                        <span className='th-sort-icon' aria-hidden='true'>
                                            {sortKey === col.key ? (asc ? '▲' : '▼') : ''}
                                        </span>
                                    </button>
                                </th>
                            ))}
                            {showMine && <th className='num'>Your avg</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(u => (
                            <tr key={u.unit_id}>
                                <td className='unit-cell'>
                                    <UnitPortrait id={u.unit_id} />
                                    <span>{u.name}</span>
                                </td>
                                <td className='num'>{u.play_rate}%</td>
                                <td className='num'>{u.avg_placement.toFixed(2)}</td>
                                <td className='num'>{u.top4_rate}%</td>
                                <td className='num'>{u.games}</td>
                                {showMine && <YourAvgCell mine={mine.get(u.unit_id)} metaAvg={u.avg_placement} />}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
