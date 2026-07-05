import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getPlayerDashboard } from '@/features/player/api'
import { defaultTagFor } from '@/lib/regions'
import type { DashboardData } from '@/types/tft'
import SearchBar from '@/features/player/SearchBar'
import PlayerProfile from '@/features/player/PlayerProfile'

export default function SearchPage() {
    const [searchParams] = useSearchParams()
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

    // Deep link: /player?region=na&name=Foo&tag=NA1 (leaderboard names point here).
    // Re-runs whenever the params change so navigating between players refetches.
    const qRegion = searchParams.get('region') ?? 'na'
    const qName = searchParams.get('name') ?? ''
    const qTag = searchParams.get('tag') ?? ''
    useEffect(() => {
        if (qName) handleSearch(qRegion, qName, qTag || defaultTagFor(qRegion))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qRegion, qName, qTag])

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
