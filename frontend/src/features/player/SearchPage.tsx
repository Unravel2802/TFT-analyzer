import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlayerDashboard } from '@/features/player/api'
import type { DashboardData } from '@/types/tft'
import SearchBar from '@/features/player/SearchBar'
import PlayerProfile from '@/features/player/PlayerProfile'

export default function SearchPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSearch(region: string, gameName: string, tagLine: string) {
        setLoading(true)
        setError(null)
        try {
            const result = await getPlayerDashboard(region, gameName, tagLine)
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Player not found')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='page'>
            {/* Landing hero: shown until a search resolves. Once we have a
                player, PlayerProfile renders its own identity header, so we
                collapse to just the search bar to avoid stacking two heroes. */}
            {!data && (
                <section className='hero-search'>
                    <h1 className='hero-search-title'>Know your game.<br />Climb your rank.</h1>
                    <p className='hero-search-sub'>
                        Search any Riot ID for rank, recent placements, and live meta stats.
                    </p>
                    <SearchBar onSearch={handleSearch} loading={loading} />
                    <nav className='hero-search-links'>
                        <Link to='/leaderboard'>Leaderboard</Link>
                        <Link to='/comps'>Meta comps</Link>
                        <Link to='/units'>Unit stats</Link>
                    </nav>
                </section>
            )}

            {data && <SearchBar onSearch={handleSearch} loading={loading} />}

            {error && <p className='error-text'>{error}</p>}
            {data && <PlayerProfile data={data} />}
        </div>
    )
}
