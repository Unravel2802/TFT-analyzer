import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyClimb, setClimbGoal, resetClimbGoal } from './api'
import type { ClimbData, ClimbJourney, RankPoint } from '@/types/tft'
import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LineChart from '@/components/charts/LineChart'
import { absLpToRank, rankTickLabel, rankGridValues } from '@/lib/rank'

const TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER']
const DIVISIONS = ['IV', 'III', 'II', 'I']

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function emblemUrl(tier: string): string {
    return `https://opgg-static.akamaized.net/images/medals_new/${tier.toLowerCase()}.png`
}

// Peak rank without the trailing "· NN LP" — a compact label for the stat strip.
function peakLabel(abs: number): string {
    return absLpToRank(abs).replace(/ \d+ LP$/, '')
}

// Signed LP with a proper minus sign, for deltas.
function signedLp(n: number): string {
    return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`
}

// Consecutive snapshots → per-change LP deltas, newest first.
function recentChanges(snapshots: RankPoint[], limit = 6) {
    const changes = []
    for (let i = 1; i < snapshots.length; i++) {
        changes.push({
            abs_lp: snapshots[i].abs_lp,
            captured_at: snapshots[i].captured_at,
            delta: snapshots[i].abs_lp - snapshots[i - 1].abs_lp,
        })
    }
    return changes.reverse().slice(0, limit)
}

// A compact rank badge: emblem + label + rank/LP line, tinted by tier colour.
function RankChip({ label, tier, sub }: { label: string; tier: string; sub: string }) {
    return (
        <div className='rank-chip' data-tier={tier.toLowerCase()}>
            <img
                className='rank-chip-emblem'
                src={emblemUrl(tier)}
                alt={tier}
                onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
            />
            <div>
                <div className='rank-chip-label'>{label}</div>
                <div className='rank-chip-rank'>{tier === 'UNRANKED' ? 'Unranked' : tier}</div>
                <div className='rank-chip-lp'>{sub}</div>
            </div>
        </div>
    )
}

// The goal chase since the day it was set: how long, how far, how fast,
// and — if the pace is positive — a rough arrival estimate.
function JourneyStrip({ journey }: { journey: ClimbJourney }) {
    const j = journey
    const pace = j.lp_per_day == null
        ? '—'
        : `${signedLp(Math.round(j.lp_per_day))} /day`
    const eta = j.eta_days === 0
        ? 'Reached 🎉'
        : j.eta_days == null
            ? '—'
            : `~${j.eta_days} day${j.eta_days === 1 ? '' : 's'}`

    return (
        <div className='climb-journey'>
            <div className='climb-stat'>
                <span className='climb-stat-value'>Day {j.days_elapsed + 1}</span>
                <span className='climb-stat-label'>Started {formatDate(j.started_at)}</span>
            </div>
            <div className='climb-stat'>
                <span className={`climb-stat-value ${j.lp_gained > 0 ? 'pos' : j.lp_gained < 0 ? 'neg' : ''}`}>
                    {signedLp(j.lp_gained)} LP
                </span>
                <span className='climb-stat-label'>Since goal set</span>
            </div>
            <div className='climb-stat'>
                <span className='climb-stat-value'>{pace}</span>
                <span className='climb-stat-label'>Pace</span>
            </div>
            <div className='climb-stat'>
                <span className='climb-stat-value'>{eta}</span>
                <span className='climb-stat-label'>Est. to goal</span>
            </div>
        </div>
    )
}

// Forecast ray: from the last snapshot, one point per day at the current
// lp_per_day pace until the goal (capped so a slow pace can't dwarf history).
const MAX_PROJECTED_DAYS = 14

function buildProjection(
    snapshots: RankPoint[], journey: ClimbJourney | null, goalAbs?: number,
): (number | null)[] | undefined {
    if (!journey || journey.lp_per_day == null || journey.lp_per_day <= 0 || goalAbs == null) return undefined
    const last = snapshots[snapshots.length - 1].abs_lp
    if (last >= goalAbs) return undefined   // already there — nothing to project

    const pace = journey.lp_per_day
    const days = Math.min(Math.ceil((goalAbs - last) / pace), MAX_PROJECTED_DAYS)
    // null-padded so projected x indices continue where the real series ends;
    // repeating `last` at the seam connects the dashed ray to the solid line
    const points: (number | null)[] = new Array<number | null>(snapshots.length - 1).fill(null)
    points.push(last)
    for (let d = 1; d <= days; d++) {
        points.push(Math.min(goalAbs, Math.round(last + pace * d)))
    }
    return points
}

function LpChart({ snapshots, journey, goalAbs }: {
    snapshots: RankPoint[]; journey: ClimbJourney | null; goalAbs?: number
}) {
    if (snapshots.length === 0) {
        return <p className='insight-empty'>No data yet — play a ranked game and check back.</p>
    }

    const values = snapshots.map(s => s.abs_lp)
    const all = goalAbs != null ? [...values, goalAbs] : values
    const projection = buildProjection(snapshots, journey, goalAbs)

    return (
        <LineChart
            values={values}
            ariaLabel={`Rank over time across ${snapshots.length} rank changes`}
            gridValues={rankGridValues(Math.min(...all), Math.max(...all))}
            formatValue={absLpToRank}
            formatTick={rankTickLabel}
            xLabel={i => i < snapshots.length
                ? formatDate(snapshots[i].captured_at)
                : `in ~${i - snapshots.length + 1}d at current pace`}
            referenceY={goalAbs}
            projectionValues={projection}
        />
    )
}

export default function ClimbPage() {
    const { token } = useAuth()
    const [data, setData] = useState<ClimbData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tier, setTier] = useState('DIAMOND')
    const [division, setDivision] = useState('IV')
    const [saving, setSaving] = useState(false)
    const [confirmReset, setConfirmReset] = useState(false)
    const [resetting, setResetting] = useState(false)

    const load = useCallback(async () => {
        try {
            const d = await getMyClimb(token!)   // await first — no setState before this
            setData(d)
            setError(null)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load')
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => { load() }, [load])

    async function saveGoal(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            await setClimbGoal(token!, tier, tier === 'MASTER' ? '' : division)
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to set goal')
        } finally {
            setSaving(false)
        }
    }

    // Two-click reset: first click arms the button, second actually deletes.
    async function handleReset() {
        if (!confirmReset) {
            setConfirmReset(true)
            return
        }
        setResetting(true)
        try {
            await resetClimbGoal(token!)
            setConfirmReset(false)
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to reset goal')
        } finally {
            setResetting(false)
        }
    }

    if (loading) return <div className='page'><p className='status-text'>Loading your climb…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>
    if (!data) return null

    const c = data.current
    const currentSub = c.tier === 'UNRANKED' ? '' : `${c.division} · ${c.lp} LP`
    const goal = data.goal
    const goalLocked = goal != null && !goal.can_change
    const lpToGo = data.progress ? Math.max(0, data.progress.goal_abs_lp - data.progress.current_abs_lp) : null

    // Derived climb stats from the snapshot history.
    const snaps = data.snapshots
    const netLp = snaps.length >= 2 ? snaps[snaps.length - 1].abs_lp - snaps[0].abs_lp : null
    const peakAbs = snaps.length > 0 ? Math.max(...snaps.map(s => s.abs_lp)) : null
    const changes = recentChanges(snaps)

    return (
        <div className='page page-doc'>
            <PageHeader
                title='Climb'
                subtitle='Track your rank over time and set a goal to chase'
            />

            <section className='panel'>
                <div className='climb-hero'>
                    <RankChip label='Current' tier={c.tier} sub={currentSub} />
                    {goal && (
                        <>
                            <span className='climb-arrow'>→</span>
                            <RankChip
                                label='Goal'
                                tier={goal.target_tier}
                                sub={goal.target_tier === 'MASTER' ? '' : goal.target_division}
                            />
                        </>
                    )}
                    {data.progress && (
                        <div className='climb-progress-wide'>
                            <div className='climb-progress-top'>
                                <span className='climb-progress-pct'>{data.progress.percent}%</span>
                                <span className='climb-progress-note'>
                                    {lpToGo === 0 ? 'Goal reached — set a new one!' : `${lpToGo} LP to go`}
                                </span>
                            </div>
                            <div className='climb-bar-lg'>
                                <div className='climb-bar-fill' style={{ width: `${data.progress.percent}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                {data.journey && (
                    <div className='climb-journey-row'>
                        <JourneyStrip journey={data.journey} />
                        <div className='climb-reset'>
                            {confirmReset && !resetting && (
                                <Button variant='ghost' type='button' onClick={() => setConfirmReset(false)}>
                                    Keep it
                                </Button>
                            )}
                            <Button
                                variant='ghost'
                                type='button'
                                className={confirmReset ? 'btn-danger' : undefined}
                                disabled={resetting}
                                onClick={handleReset}
                            >
                                {resetting ? 'Resetting…' : confirmReset ? 'Confirm reset' : 'Reset goal'}
                            </Button>
                        </div>
                    </div>
                )}

                {snaps.length >= 2 && (
                    <div className='climb-stats'>
                        {netLp != null && (
                            <div className='climb-stat'>
                                <span className={`climb-stat-value ${netLp > 0 ? 'pos' : netLp < 0 ? 'neg' : ''}`}>
                                    {signedLp(netLp)} LP
                                </span>
                                <span className='climb-stat-label'>Net change</span>
                            </div>
                        )}
                        {peakAbs != null && (
                            <div className='climb-stat'>
                                <span className='climb-stat-value'>{peakLabel(peakAbs)}</span>
                                <span className='climb-stat-label'>Peak</span>
                            </div>
                        )}
                        <div className='climb-stat'>
                            <span className='climb-stat-value'>{snaps.length}</span>
                            <span className='climb-stat-label'>Ranked games</span>
                        </div>
                    </div>
                )}
            </section>

            <section className='panel'>
                <h3 className='panel-title'>Rank over time</h3>
                <LpChart snapshots={data.snapshots} journey={data.journey} goalAbs={data.goal?.target_abs_lp} />
            </section>

            {changes.length > 0 && (
                <section className='panel'>
                    <h3 className='panel-title'>Recent changes</h3>
                    <ul className='change-list'>
                        {changes.map((ch, i) => (
                            <li key={i} className='change-row'>
                                <span className='change-rank'>{absLpToRank(ch.abs_lp)}</span>
                                <span className='change-date'>{formatDate(ch.captured_at)}</span>
                                <span className={`change-delta ${ch.delta > 0 ? 'pos' : ch.delta < 0 ? 'neg' : ''}`}>
                                    {signedLp(ch.delta)} LP
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className='panel goal-form-panel'>
                <h3 className='panel-title'>{goal ? 'Change goal' : 'Set a goal'}</h3>
                <form className='climb-goal-form' onSubmit={saveGoal}>
                    <span>Reach</span>
                    <Dropdown
                        options={TIERS.map(t => ({ value: t, label: t }))}
                        value={tier}
                        onChange={setTier}
                    />
                    {tier !== 'MASTER' && (
                        <Dropdown
                            options={DIVISIONS.map(d => ({ value: d, label: d }))}
                            value={division}
                            onChange={setDivision}
                        />
                    )}
                    <Button disabled={saving || goalLocked}>
                        {saving ? 'Saving…' : goal ? 'Change goal' : 'Set goal'}
                    </Button>
                </form>
                {goalLocked && goal && (
                    <p className='goal-lock-note'>
                        Goal changes are locked until {formatDate(goal.locked_until)} to keep you
                        committed — resetting the goal above clears it (and the lock) immediately.
                    </p>
                )}
            </section>
        </div>
    )
}
