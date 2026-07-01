import { useEffect, useState } from 'react'
import { getLeaderboard } from './api'
import type { LeaderboardEntry } from '@/types/tft'

const REGIONS = [
    { value: 'NA1',  label: 'NA' },
    { value: 'EUW1', label: 'EUW' },
    { value: 'EUN1', label: 'EUNE' },
    { value: 'KR',   label: 'KR' },
    { value: 'BR1',  label: 'BR' },
    { value: 'JP1',  label: 'JP' },
    { value: 'OC1',  label: 'OCE' },
]

export default function LeaderboardPage() {
    const [region, setRegion] = useState('NA1')
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

            <select
                className='region-select'
                value={region}
                onChange={e => setRegion(e.target.value)}
            >
                {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            {loading && <p className='page-tagline'>Loading leaderboard…</p>}
            {error && <div className='error-box'><p className='error-text'>{error}</p></div>}

            {!loading && !error && (
                <table className='meta-table'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Tier</th>
                            <th>LP</th>
                            <th>Wins</th>
                            <th>Losses</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.puuid}>
                                <td>{r.rank}</td>
                                <td>{r.game_name ? `${r.game_name}#${r.tag_line}` : r.puuid.slice(0, 8) + '…'}</td>
                                <td>{r.tier}</td>
                                <td>{r.league_points}</td>
                                <td>{r.wins}</td>
                                <td>{r.losses}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}