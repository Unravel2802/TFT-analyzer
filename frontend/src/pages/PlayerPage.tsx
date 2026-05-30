import { useState } from 'react'
import { getPlayerStats } from '../api/tft'
import type { PlayerStats } from '../types/tft'
import SearchBar from '../components/SearchBar'
import StatCard from '../components/StatCard'
import TopList from '../components/TopList'

export default function PlayerPage() {
    const [stats, setStats] = useState<PlayerStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSearch(region: string, gameName: string, tagLine: string) {
        setLoading(true)
        setError(null)
        setStats(null)

        try {
            const data = await getPlayerStats(region, gameName, tagLine)
            setStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load stats.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='page'>
            <h1 className='page-title'>TierMind</h1>
            <p className="page-tagline">Know your game. Climb your rank.</p>

            <SearchBar onSearch={handleSearch} />
            {loading && <p className="status-text">Scouting the board...</p>}
            {error && <p className="error-text">{error}</p>}
            {stats && (
                <div className="results">
                    <div className="rank-display">
                        <span className="rank-tier">{stats.tier}</span>
                        {stats.rank && <span className="rank-division">{stats.rank}</span>}
                        {stats.tier !== "UNRANKED" && <span className="rank-lp"> - {stats.lp} LP</span>}
                    </div>
                    <div className="stat-cards">
                        <StatCard label="Avg Placement" value={stats.avg_placement.toFixed(2)} />
                        <StatCard label="Top 4 Rate" value={stats.top4_rate} />
                        <StatCard label="Win Rate" value={stats.win_rate} />
                    </div>

                    <div className='top-lists'>
                        <TopList title="Top Units" entries={stats.top_units} />
                        <TopList title="Top Traits" entries={stats.top_traits} />
                    </div>
                </div>
            )}
        </div>
    )
}