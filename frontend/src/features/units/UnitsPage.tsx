import { useEffect, useState } from 'react'
import { getUnitsMeta } from './api'
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

export default function UnitsPage() {
    const [units, setUnits] = useState<UnitStat[]>([])
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

    function toggleSort(key: SortKey) {
        if (key === sortKey) {
            setAsc(a => !a)
        } else {
            setSortKey(key)
            setAsc(defaultAsc(key))
        }
    }

    const sorted = [...units].sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]))

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
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(u => (
                            <tr key={u.unit_id}>
                                <td className='unit-cell'>
                                    <UnitPortrait id={u.unit_id} />
                                    <span>{u.name}</span>
                                </td>
                                <td>{u.play_rate}%</td>
                                <td>{u.avg_placement}</td>
                                <td>{u.top4_rate}%</td>
                                <td>{u.games}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
