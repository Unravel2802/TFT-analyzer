import { useEffect, useState } from 'react'
import { getLeaderboard } from './api'
import type { LeaderboardEntry } from '@/types/tft'
import Dropdown from '@/components/Dropdown'
import TableSkeleton from '@/components/TableSkeleton'
import { REGION_OPTIONS } from '@/lib/regions'

export default function LeaderboardPage() {
    const [region, setRegion] = useState('na')
    const [rows, setRows] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        setLoading(true)
        setError(null)
        getLeaderboard(region)
            .then(data => { if (active) setRows(data) })
            .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Failed to load') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [region])

    return (
        <div className='page'>
            <h1 className='page-title'>Leaderboard</h1>
            <p className='page-tagline'>Top ranked players on the live ladder.</p>

            <Dropdown options={REGION_OPTIONS} value={region} onChange={setRegion} />

            {loading && <TableSkeleton rows={10} cols={6} />}
            {error && <div className='error-box'><p className='error-text'>{error}</p></div>}

            {!loading && !error && (
                <table className='meta-table'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Tier</th>
                            <th className='num'>LP</th>
                            <th className='num'>Wins</th>
                            <th className='num'>Losses</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.puuid}>
                                <td>{r.rank}</td>
                                <td>{r.game_name ? `${r.game_name}#${r.tag_line}` : r.puuid.slice(0, 8) + '…'}</td>
                                <td>{r.tier}</td>
                                <td className='num'>{r.league_points}</td>
                                <td className='num'>{r.wins}</td>
                                <td className='num'>{r.losses}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}