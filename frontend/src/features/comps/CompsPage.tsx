import { useEffect, useState } from 'react'
import { getCompsMeta } from './api'
import type { CompStat } from '@/types/tft'

type SortKey = 'play_rate' | 'avg_placement' | 'top4_rate' | 'win_rate' | 'games'

export default function CompsPage() {
    const [comps, setComps] = useState<CompStat[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortKey, setSortKey] = useState<SortKey>('avg_placement')

    useEffect(() => {
        let active = true
        getCompsMeta()
            .then(data => { if (active) setComps(data) })
            .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Failed to load') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    const sorted = [...comps].sort((a, b) =>
        sortKey === 'avg_placement' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
    )

    if (loading) return <div className='page'><p className='page-tagline'>Loading comps…</p></div>
    if (error) return (
        <div className='page'>
            <div className='error-box'><p className='error-text'>{error}</p></div>
        </div>
    )

    return (
        <div className='page'>
            <h1 className='page-title'>Comps</h1>
            <p className='page-tagline'>Best team comps by average placement across tracked games.</p>

            <table className='meta-table'>
                <thead>
                    <tr>
                        <th>Comp</th>
                        <th className='sortable' onClick={() => setSortKey('play_rate')}>Play rate</th>
                        <th className='sortable' onClick={() => setSortKey('avg_placement')}>Avg place</th>
                        <th className='sortable' onClick={() => setSortKey('top4_rate')}>Top 4</th>
                        <th className='sortable' onClick={() => setSortKey('win_rate')}>Win %</th>
                        <th className='sortable' onClick={() => setSortKey('games')}>Games</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map(c => (
                        <tr key={c.name}>
                            <td>{c.name}</td>
                            <td>{c.play_rate}%</td>
                            <td>{c.avg_placement}</td>
                            <td>{c.top4_rate}%</td>
                            <td>{c.win_rate}%</td>
                            <td>{c.games}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}