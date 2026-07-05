import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMySessions } from './api'
import type { SessionsInsights } from '@/types/tft'
import PageHeader from '@/components/PageHeader'
import BarChart from '@/components/charts/BarChart'

// Lower avg placement is better, so the tallest bar is the WORST bucket.
// Color carries the verdict instead: best bucket green, worst red, rest neutral.
function timeOfDayBars(buckets: SessionsInsights['time_of_day']) {
    const values = buckets.map(b => b.avg_placement)
    const best = Math.min(...values)
    const worst = Math.max(...values)
    return buckets.map(b => ({
        label: b.part,
        value: b.avg_placement,
        color:
            best === worst ? 'var(--text-muted)'
            : b.avg_placement === best ? 'var(--top4)'
            : b.avg_placement === worst ? 'var(--bot4)'
            : 'var(--text-muted)',
    }))
}

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

    if (loading) return <div className='page'><p className='status-text'>Analyzing your sessions…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>
    if (!data) return null

    const s = data.current_streak
    const tilt = data.after_two_losses
    // meaningfully worse = at least half a placement below your overall average
    const tiltWorse = tilt != null && tilt.avg_placement - data.overall_avg_placement >= 0.5

    const buckets = data.time_of_day
    const sorted = [...buckets].sort((a, b) => a.avg_placement - b.avg_placement)
    const bestBucket = buckets.length >= 2 ? sorted[0] : null
    const worstBucket = buckets.length >= 2 ? sorted[sorted.length - 1] : null

    return (
        <div className='page page-doc'>
            <PageHeader
                title='Sessions'
                subtitle={`Streaks, tilt and timing across your last ${data.games_analyzed} games`}
                stats={[{ label: 'Overall avg', value: data.overall_avg_placement }]}
            />

            <div className='insight-grid'>
                <div className='insight-card'>
                    <div className='insight-card-head'>
                        <span className={`insight-dot insight-dot-${s?.type === 'loss' ? 'bad' : 'good'}`} />
                        <h3 className='insight-card-title'>Current streak</h3>
                    </div>
                    {s ? (
                        <p className='streak-big'>
                            <span className={`streak-num ${s.type === 'loss' ? 'coach-bad' : 'coach-good'}`}>
                                {s.count}
                            </span>
                            <span className='streak-word'>{s.type === 'loss' ? 'losses in a row' : 'wins in a row'}</span>
                        </p>
                    ) : <p className='insight-empty'>No active streak.</p>}

                    {tilt && (
                        <div className={`callout ${tiltWorse ? 'callout-bad' : 'callout-good'}`}>
                            <span className='callout-icon'>{tiltWorse ? '⚠️' : '💪'}</span>
                            <span>
                                {tiltWorse
                                    ? `After two straight losses you average ${tilt.avg_placement} — noticeably below your ${data.overall_avg_placement} overall. Consider a short break.`
                                    : `After two straight losses you average ${tilt.avg_placement} vs ${data.overall_avg_placement} overall — you recover well.`}
                                <span className='muted'> ({tilt.games} games)</span>
                            </span>
                        </div>
                    )}
                </div>

                <div className='insight-card'>
                    <div className='insight-card-head'>
                        <span className='insight-dot insight-dot-good' />
                        <h3 className='insight-card-title'>Avg placement by time of day</h3>
                    </div>
                    {buckets.length === 0
                        ? <p className='insight-empty'>Not enough games yet.</p>
                        : (
                            <>
                                <BarChart
                                    bars={timeOfDayBars(buckets)}
                                    ariaLabel='Average placement by time of day (lower is better)'
                                    showValues
                                    tooltipLabel={i => `${buckets[i].part} · ${buckets[i].games} games`}
                                    max={8}
                                />
                                <div className='tod-foot'>
                                    {bestBucket && (
                                        <span className='tod-chip tod-chip-good'>
                                            Best · {bestBucket.part} ({bestBucket.games}g)
                                        </span>
                                    )}
                                    {worstBucket && (
                                        <span className='tod-chip tod-chip-bad'>
                                            Worst · {worstBucket.part} ({worstBucket.games}g)
                                        </span>
                                    )}
                                    <span className='insight-empty'>Lower is better</span>
                                </div>
                            </>
                        )}
                </div>
            </div>
        </div>
    )
}
