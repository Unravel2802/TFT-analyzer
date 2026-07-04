import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMySessions } from './api'
import type { SessionsInsights } from '@/types/tft'
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

    if (loading) return <div className='page'><p className='page-tagline'>Analyzing your sessions…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>
    if (!data) return null

    const s = data.current_streak
    const tilt = data.after_two_losses
    // meaningfully worse = at least half a placement below your overall average
    const tiltWorse = tilt != null && tilt.avg_placement - data.overall_avg_placement >= 0.5

    const buckets = data.time_of_day
    const bestBucket = buckets.length >= 2
        ? buckets.reduce((a, b) => (b.avg_placement < a.avg_placement ? b : a))
        : null

    return (
        <div className='page'>
            <h1 className='page-title'>Sessions</h1>
            <p className='page-tagline'>
                From your last {data.games_analyzed} games · overall avg {data.overall_avg_placement}
            </p>

            <div className='coach-grid'>
                <div className='coach-card'>
                    <h3 className='coach-card-title'>Current streak</h3>
                    {s ? (
                        <p className='streak-line'>
                            <span className={`streak-count ${s.type === 'loss' ? 'coach-bad' : 'coach-good'}`}>
                                {s.count}
                            </span>
                            <span className='streak-label'>{s.type === 'loss' ? 'losses' : 'wins'} in a row</span>
                        </p>
                    ) : <p className='muted'>No active streak.</p>}

                    {tilt && (
                        <p className={tiltWorse ? 'coach-bad' : 'coach-good'}>
                            {tiltWorse
                                ? `After two straight losses you average ${tilt.avg_placement} — noticeably below your ${data.overall_avg_placement} overall. Consider a short break after two losses.`
                                : `After two straight losses you average ${tilt.avg_placement} vs ${data.overall_avg_placement} overall — you recover well.`}
                            <span className='muted'> ({tilt.games} games)</span>
                        </p>
                    )}
                </div>

                <div className='coach-card'>
                    <h3 className='coach-card-title'>Avg placement by time of day</h3>
                    {buckets.length === 0
                        ? <p className='muted'>Not enough games yet.</p>
                        : (
                            <>
                                <BarChart
                                    bars={timeOfDayBars(buckets)}
                                    ariaLabel='Average placement by time of day (lower is better)'
                                    showValues
                                    tooltipLabel={i => `${buckets[i].part} · ${buckets[i].games} games`}
                                    max={8}
                                />
                                <p className='muted'>Lower is better.
                                    {bestBucket && ` You place best in the ${bestBucket.part.toLowerCase()}.`}
                                </p>
                            </>
                        )}
                </div>
            </div>
        </div>
    )
}
