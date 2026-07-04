import { useEffect, useState } from 'react'
import { getUnitsMeta } from './api'
import type { UnitStat } from '@/types/tft'
import UnitPortrait from '@/components/UnitPortrait'

type SortKey = 'play_rate' | 'avg_placement' | 'top4_rate' | 'games'

export default function UnitsPage() {
    const [units, setUnits] = useState<UnitStat[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortKey, setSortKey] = useState<SortKey>('avg_placement')
    
    useEffect(() => {
        let active = true
        getUnitsMeta()
            .then(data => { if (active) setUnits(data) })
            .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Failed to load') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false}
    }, [])

    const sorted = [...units].sort((a, b) => 
        sortKey === 'avg_placement' ? a[sortKey] - b[sortKey]  : b[sortKey] - a[sortKey]
    )

    if (loading) return <div className='page'><p className='page-tagline'>Loading units...</p></div>
    if (error) return (
        <div className='page'>
            <div className='error-box'><p className='error-text'>{error}</p></div>
        </div>
    )

    return (
        <div className='page'>
            <h1 className='page-title'>Units</h1>
            <p className='page-tagline'>Per-unit performance across recent Challenger/Master games.</p>

            <table className='meta-table'>
                <thead>
                    <tr>
                        <th>Unit</th>
                        <th className='sortable' onClick={() => setSortKey('play_rate')}>Play rate</th>
                        <th className='sortable' onClick={() => setSortKey('avg_placement')}>Average Placement</th>
                        <th className='sortable' onClick={() => setSortKey('top4_rate')}>Top 4 Rate</th>
                        <th className='sortable' onClick={() => setSortKey('games')}>Games</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map(u => {
                        return (
                            <tr key={u.unit_id}>
                                <td className='unit-cell'>
                                    <UnitPortrait id={u.unit_id} />
                                    <span>{u.name}</span>
                                </td>
                                <td>{u.play_rate}%</td>
                                <td>{u.avg_placement}</td>
                                <td>{u.top4_rate}</td>
                                <td>{u.games}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}