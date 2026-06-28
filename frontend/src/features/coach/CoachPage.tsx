import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyCoach } from './api'
import type { CoachInsights, CoachStat } from '@/types/tft'

function StatList({ title, stats, tone }: { title: string; stats: CoachStat[]; tone: 'good' | 'bad' }) {
    return (
        <div className='coach-card'>
            <h3 className='coach-card-title'>{title}</h3>
            {stats.length === 0
                ? <p className='muted'>Not enough games yet.</p>
                : (
                    <ul className='coach-list'>
                        {stats.map(s => (
                            <li key={s.name} className='coach-row'>
                                <span>{s.name}</span>
                                <span className={tone === 'good' ? 'coach-good' : 'coach-bad'}>
                                    {s.avg_placement} avg · {s.games}g
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
        </div>
    )
}

export default function CoachPage() {
    const { token } = useAuth()
    const [data, setData] = useState<CoachInsights | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        getMyCoach(token!)
            .then(d => { if (active) setData(d) })
            .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Failed to load') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [token])

    if (loading) return <div className='page'><p className='page-tagline'>Analyzing your games…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>
    if (!data) return null

    return (
        <div className='page'>
            <h1 className='page-title'>Personal Coach</h1>
            <p className='page-tagline'>
                From your last {data.games_analyzed} games · overall avg {data.overall_avg_placement}
            </p>

            <div className='coach-grid'>
                <StatList title='Best traits' stats={data.best_traits} tone='good' />
                <StatList title='Worst traits' stats={data.worst_traits} tone='bad' />
                <StatList title='Best units' stats={data.best_units} tone='good' />
                <StatList title='Worst units' stats={data.worst_units} tone='bad' />
            </div>
        </div>
    )
}