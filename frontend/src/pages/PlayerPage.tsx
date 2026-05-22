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

    async function handleSearch(gameName: string, tagLine: string) {
        setLoading(true)
        setError(null)
        setStats(null)

        try {
            const data = await getPlayerStats(gameName, tagLine)
            setStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load statsgi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1> TFT Analyzer</h1>

            <SearchBar onSearch={handleSearch} />
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {stats && (
                <div>
                    <div className="stat-cards">
                        <StatCard label="Avg Placement" value={stats.avg_placement} />
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