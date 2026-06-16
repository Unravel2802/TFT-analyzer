import { useState } from 'react'
import { getPlayerDashboard } from '../api/tft'
import type { DashboardData } from '../types/tft'
import SearchBar from '../components/SearchBar'
import PlayerProfile from '../components/PlayerProfile'

interface SearchPageProps {
    onLogin: () => void
    onSignup: () => void
}

export default function SearchPage({ onLogin, onSignup }: SearchPageProps) {
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
            <div className='dashboard-header'>
                <h1 className='page-title'>TierMind</h1>
                <div className='auth-buttons'>
                    <button className='text-button' onClick={onLogin}>Sign In</button>
                    <button className='primary-button' onClick={onSignup}>Sign Up</button>
                </div>
            </div>
            <p className='page-tagline'>Know your game. Climb your rank.</p>

            <SearchBar onSearch={handleSearch} loading={loading} />

            {error && <p className='error-text'>{error}</p>}
            {data && <PlayerProfile data={data} />}
        </div>
    )
}