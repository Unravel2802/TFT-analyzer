import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyCoach } from './api'
import type { CoachInsights, CoachStat } from '@/types/tft'
import PageHeader from '@/components/PageHeader'

// A signed delta vs the player's overall average. Negative = better than
// average (good), positive = worse. Rendered with a proper minus sign.
function fmtDelta(diff: number): string {
    const rounded = Math.abs(diff).toFixed(1)
    return diff <= 0 ? `−${rounded}` : `+${rounded}`
}

function InsightCard({
    title, stats, tone, overall,
}: { title: string; stats: CoachStat[]; tone: 'good' | 'bad'; overall: number }) {
    return (
        <div className='insight-card'>
            <div className='insight-card-head'>
                <span className={`insight-dot insight-dot-${tone}`} />
                <h3 className='insight-card-title'>{title}</h3>
            </div>
            {stats.length === 0
                ? <p className='insight-empty'>Not enough games yet.</p>
                : (
                    <ul className='insight-rows'>
                        {stats.map((s, i) => {
                            const diff = s.avg_placement - overall
                            return (
                                <li key={s.name} className='insight-row'>
                                    <span className='insight-rank'>{i + 1}</span>
                                    <span className='insight-name'>{s.name}</span>
                                    <span
                                        className={`insight-delta insight-delta-${tone}`}
                                        title={`${s.avg_placement} avg vs ${overall} overall`}
                                    >
                                        {fmtDelta(diff)}
                                    </span>
                                    <span className='insight-games'>{s.games}g</span>
                                </li>
                            )
                        })}
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

    if (loading) return <div className='page'><p className='status-text'>Analyzing your games…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>
    if (!data) return null

    return (
        <div className='page page-doc'>
            <PageHeader
                title='Coach'
                subtitle={`What's working — and what's costing you — across your last ${data.games_analyzed} games`}
                stats={[{ label: 'Overall avg', value: data.overall_avg_placement }]}
            />

            <div className='insight-grid'>
                <InsightCard title='Best traits' stats={data.best_traits} tone='good' overall={data.overall_avg_placement} />
                <InsightCard title='Worst traits' stats={data.worst_traits} tone='bad' overall={data.overall_avg_placement} />
                <InsightCard title='Best units' stats={data.best_units} tone='good' overall={data.overall_avg_placement} />
                <InsightCard title='Worst units' stats={data.worst_units} tone='bad' overall={data.overall_avg_placement} />
            </div>
        </div>
    )
}
