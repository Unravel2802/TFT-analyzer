import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyStats } from '../api/tft'
import type { PlayerStats } from '../types/tft'
import StatCard from '../components/StatCard'
import TopList from '../components/TopList'

export default function DashboardPage() {
    const { token, logout } = useAuth()
    const [stats, setStats] = useState<PlayerStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getMyStats(token!)
                setStats(data)
            } catch (err) {
                setError(err instanceof Error? err.message : 'Failed to load stats')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <div className='page'>
            <div className='dashboard-header'>
                <h1 className='page-title'>TierMind</h1>
                <button className='logout-button' onClick={logout}>Sign Out</button>
            </div>
            <p className='page-tagline'>Know your game. Climb your rank.</p>

            {loading && <p className='status-text'>Loading your stats...</p>}
            {error && <p className='error-text'>{error}</p>}

            {stats && (
                <div className='results'>
                    <div className='player-name'>{stats.riot_id.split('#')[0]}</div>
                    <div className='rank-display'>
                        <span className='rank-tier'>{stats.tier}</span>
                        {stats.rank && <span className='rank-division'>{stats.rank}</span>}
                        {stats.tier !== 'UNRANKED' && <span className='rank-lp'> - {stats.lp} LP </span>}
                    </div>

                    <div className='stat-cards'>
                        <StatCard label='Avg Placement' value={stats.avg_placement.toFixed(2)}/>
                        <StatCard label='Top 4 Rate' value={stats.top4_rate}/>
                        <StatCard label='Win Rate' value={stats.win_rate}/>
                    </div>

                    <div className='top-lists'>
                        <TopList title='Top Units' entries={stats.top_units}/>
                        <TopList title='Top Traits' entries={stats.top_traits}/>
                    </div>    
                </div>
            )}
        </div>
    )
}