import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyDashboard, getPlayerDashboard } from '../api/tft'
import type { DashboardData } from '../types/tft'
import SearchBar from '../components/SearchBar'
import PlayerProfile from '../components/PlayerProfile'
import ProfileSkeleton from '../components/ProfileSkeleton'

export default function DashboardPage() {
    const { token, logout } = useAuth()
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
            <div className='dashboard-header'>
                <h1 className='page-title'>TierMind</h1>
                <button className='logout-button' onClick={logout}>Sign Out</button>
            </div>
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