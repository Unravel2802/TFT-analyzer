import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyDashboard, getPlayerDashboard } from '@/features/player/api'
import type { DashboardData } from '@/types/tft'
import SearchBar from '@/features/player/SearchBar'
import PlayerProfile from '@/features/player/PlayerProfile'
import ProfileSkeleton from '@/features/player/ProfileSkeleton'

export default function DashboardPage() {
    const { token } = useAuth()
    const [ownData, setOwnData] = useState<DashboardData | null>(null)
    const [viewedData, setViewedData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)
    const lastAttempt = useRef<() => void>(() => {})
    const [error, setError] = useState<string | null>(null)

    async function fetchOwn() {
        lastAttempt.current = fetchOwn
        setLoading(true)
        setError(null)
        try {
            const data = await getMyDashboard(token!)
            setOwnData(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => {
        fetchOwn()
    }, [])

    async function handleSearch(region: string, gameName: string, tagLine: string) {
        lastAttempt.current = () => handleSearch(region, gameName, tagLine)
        setSearchLoading(true)
        setError(null)
        try {
            const result = await getPlayerDashboard(region, gameName, tagLine)
            setViewedData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Player not found')
        } finally {
            setSearchLoading(false)
        }
    }

    const displayed = viewedData ?? ownData

    return (
        <div className='page'>
            <p className='page-tagline'>Know your game. Climb your rank.</p>

            <SearchBar onSearch={handleSearch} loading={searchLoading} />

            {viewedData && (
                <button className='back-button' onClick={() => setViewedData(null)}>
                    ← Back to my profile
                </button>
            )}

            {loading && <ProfileSkeleton />}
            {error && (
                <div className='error-box'>
                    <p className='error-text'>{error}</p>
                    <button className='retry-button' onClick={() => lastAttempt.current()}>
                        Try again
                    </button>
                </div>
            )}

            {displayed && <PlayerProfile data={displayed} />}
        </div>
    )
}