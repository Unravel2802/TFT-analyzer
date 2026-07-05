import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboard } from './api'
import type { LeaderboardEntry } from '@/types/tft'
import Dropdown from '@/components/Dropdown'
import TableSkeleton from '@/components/TableSkeleton'
import { REGION_OPTIONS } from '@/lib/regions'

// 'rank' is the default (ladder order); the stat columns are click-to-sort.
type SortKey = 'rank' | 'league_points' | 'wins' | 'losses'

const STAT_COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'league_points', label: 'LP' },
    { key: 'wins', label: 'Wins' },
    { key: 'losses', label: 'Losses' },
]

function tierLabel(tier: string): string {
    return tier.charAt(0) + tier.slice(1).toLowerCase()
}

export default function LeaderboardPage() {
    const [region, setRegion] = useState('na')
    const [rows, setRows] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortKey, setSortKey] = useState<SortKey>('rank')
    const [asc, setAsc] = useState(true) // rank ascending = top of the ladder first

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

    function toggleSort(key: SortKey) {
        if (key === sortKey) {
            setAsc(a => !a)
        } else {
            setSortKey(key)
            setAsc(false) // stats read high-first by default
        }
    }

    const sorted = [...rows].sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]))

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
                            {STAT_COLUMNS.map(col => (
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
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(r => (
                            <tr key={r.puuid}>
                                <td>{r.rank}</td>
                                <td>
                                    {r.game_name && r.tag_line ? (
                                        <Link
                                            className='lb-player'
                                            to={`/player?region=${region}&name=${encodeURIComponent(r.game_name)}&tag=${encodeURIComponent(r.tag_line)}`}
                                        >
                                            {r.game_name}<span className='lb-tag'>#{r.tag_line}</span>
                                        </Link>
                                    ) : (
                                        <span className='lb-player-anon'>{r.puuid.slice(0, 8)}…</span>
                                    )}
                                </td>
                                <td>
                                    <span className='tier-badge' data-tier={r.tier.toLowerCase()}>
                                        {tierLabel(r.tier)}
                                    </span>
                                </td>
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
