import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMySessions } from './api'
import type { SessionsInsights } from '@/types/tft'

export default function SessionsPage() {
    const { token } = useAuth()
    const [data, setData] = useState<SessionsInsights | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        const tz = -new Date().getTimezoneOffset()   // minutes ahead of UTC
        getMySessions(token!, tz)
            .then(d => { if (active) setData(d) })
            .catch(e => { if (active) setError(e instanceof Error ? e.message : 'Failed to load') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [token])

    if (loading) return <div className='page'><p className='page-tagline'>Analyzing your sessions…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>
    if (!data) return null

    const s = data.current_streak
    const streakText = s ? `${s.count}-game ${s.type} streak` : '—'

    return (
        <div className='page'>
            <h1 className='page-title'>Sessions</h1>
            <p className='page-tagline'>
                From your last {data.games_analyzed} games · overall avg {data.overall_avg_placement}
            </p>

            <div className='coach-grid'>
                <div className='coach-card'>
                    <h3 className='coach-card-title'>Current streak</h3>
                    <p className={s?.type === 'loss' ? 'coach-bad' : 'coach-good'}>{streakText}</p>
                    {data.after_two_losses && (
                        <p className='muted'>
                            After 2+ losses you average {data.after_two_losses.avg_placement} ({data.after_two_losses.games}g)
                        </p>
                    )}
                </div>

                <div className='coach-card'>
                    <h3 className='coach-card-title'>Time of day</h3>
                    {data.time_of_day.length === 0
                        ? <p className='muted'>Not enough games yet.</p>
                        : (
                            <ul className='coach-list'>
                                {data.time_of_day.map(b => (
                                    <li key={b.part} className='coach-row'>
                                        <span>{b.part}</span>
                                        <span>{b.avg_placement} avg · {b.games}g</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                </div>
            </div>
        </div>
    )
}