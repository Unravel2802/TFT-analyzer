import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyCoach } from './api'
import type { CoachInsights, CoachPlaystyle, CoachStat } from '@/types/tft'
import PageHeader from '@/components/PageHeader'

// Fewer than this many games is a shaky sample — dim the row so a lucky/unlucky
// 3-game streak isn't read as a hard verdict.
const LOW_SAMPLE = 5

// A signed delta vs the player's overall average. Negative = better than
// average (good), positive = worse. Rendered with a proper minus sign.
function fmtDelta(diff: number): string {
    const rounded = Math.abs(diff).toFixed(1)
    return diff <= 0 ? `−${rounded}` : `+${rounded}`
}

// The single strongest / weakest pick across both traits and units, so the
// takeaway banner can name one thing to lean into and one leak to plug.
function pickExtreme(a: CoachStat[], b: CoachStat[], worst: boolean): CoachStat | null {
    const all = [...a, ...b]
    if (all.length === 0) return null
    return all.reduce((best, s) =>
        (worst ? s.avg_placement > best.avg_placement : s.avg_placement < best.avg_placement) ? s : best)
}

function Takeaway({ label, tone, stat }: { label: string; tone: 'good' | 'bad'; stat: CoachStat }) {
    return (
        <div className={`takeaway-item takeaway-${tone}`}>
            <span className='takeaway-icon'>{tone === 'good' ? '▲' : '▼'}</span>
            <div>
                <div className='takeaway-label'>{label}</div>
                <div className='takeaway-body'>
                    <strong>{stat.name}</strong> — {stat.avg_placement} avg over {stat.games} games
                </div>
            </div>
        </div>
    )
}

// How your games tend to end — one row of averages that sketches your style
// (greedy econ? early exits? damage-heavy boards?).
function PlaystyleStrip({ p }: { p: CoachPlaystyle }) {
    const stats = [
        { value: p.avg_level.toFixed(1), label: 'Avg end level' },
        { value: p.avg_last_stage, label: 'Avg exit stage' },
        { value: String(p.avg_damage_dealt), label: 'Avg dmg dealt' },
        { value: p.avg_gold_left.toFixed(1), label: 'Avg gold left' },
    ]
    return (
        <div className='playstyle-strip'>
            {stats.map(s => (
                <div key={s.label} className='climb-stat'>
                    <span className='climb-stat-value'>{s.value}</span>
                    <span className='climb-stat-label'>{s.label}</span>
                </div>
            ))}
        </div>
    )
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
                            const low = s.games < LOW_SAMPLE
                            return (
                                <li key={s.name} className={`insight-row${low ? ' insight-row-low' : ''}`}>
                                    <span className='insight-rank'>{i + 1}</span>
                                    <span className='insight-name'>{s.name}</span>
                                    <span className='insight-avg'>
                                        {s.avg_placement}<span className='insight-avg-unit'>avg</span>
                                        {s.meta_avg != null && (
                                            <span
                                                className='insight-meta'
                                                title={`Ladder average on ${s.name}: ${s.meta_avg} — ${s.avg_placement <= s.meta_avg ? 'you outperform' : 'you underperform'} the field on this pick`}
                                            >
                                                meta {s.meta_avg}
                                            </span>
                                        )}
                                    </span>
                                    <span
                                        className={`insight-delta insight-delta-${tone}`}
                                        title={`${s.avg_placement} avg vs ${overall} overall`}
                                    >
                                        {fmtDelta(diff)}
                                    </span>
                                    <span
                                        className='insight-games'
                                        title={low ? 'Small sample — read with caution' : undefined}
                                    >
                                        {s.games}g
                                    </span>
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

    const lean = pickExtreme(data.best_traits, data.best_units, false)
    const leak = pickExtreme(data.worst_traits, data.worst_units, true)

    return (
        <div className='page page-doc'>
            <PageHeader
                title='Coach'
                subtitle={`What's working — and what's costing you — across your last ${data.games_analyzed} games`}
                stats={[{ label: 'Overall avg', value: data.overall_avg_placement }]}
            />

            {lean && leak && (
                <div className='coach-takeaway'>
                    <Takeaway label='Lean into' tone='good' stat={lean} />
                    <Takeaway label='Biggest leak' tone='bad' stat={leak} />
                </div>
            )}

            {data.playstyle && (
                <section className='panel'>
                    <h3 className='panel-title'>How your games end</h3>
                    <PlaystyleStrip p={data.playstyle} />
                </section>
            )}

            <div className='insight-grid'>
                <InsightCard title='Best traits' stats={data.best_traits} tone='good' overall={data.overall_avg_placement} />
                <InsightCard title='Worst traits' stats={data.worst_traits} tone='bad' overall={data.overall_avg_placement} />
                <InsightCard title='Best units' stats={data.best_units} tone='good' overall={data.overall_avg_placement} />
                <InsightCard title='Worst units' stats={data.worst_units} tone='bad' overall={data.overall_avg_placement} />
                <InsightCard title='Best items' stats={data.best_items} tone='good' overall={data.overall_avg_placement} />
                <InsightCard title='Worst items' stats={data.worst_items} tone='bad' overall={data.overall_avg_placement} />
            </div>
        </div>
    )
}
