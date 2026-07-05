import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyClimb, setClimbGoal } from './api'
import type { ClimbData, RankPoint } from '@/types/tft'
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

function LpChart({ snapshots, goalAbs }: { snapshots: RankPoint[]; goalAbs?: number }) {
    if (snapshots.length === 0) {
        return <p className='insight-empty'>No data yet — play a ranked game and check back.</p>
    }

    const values = snapshots.map(s => s.abs_lp)
    const all = goalAbs != null ? [...values, goalAbs] : values

    return (
        <LineChart
            values={values}
            ariaLabel={`Rank over time across ${snapshots.length} rank changes`}
            gridValues={rankGridValues(Math.min(...all), Math.max(...all))}
            formatValue={absLpToRank}
            formatTick={rankTickLabel}
            xLabel={i => formatDate(snapshots[i].captured_at)}
            referenceY={goalAbs}
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

    if (loading) return <div className='page'><p className='status-text'>Loading your climb…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>
    if (!data) return null

    const c = data.current
    const currentSub = c.tier === 'UNRANKED' ? '' : `${c.division} · ${c.lp} LP`
    const goal = data.goal
    const lpToGo = data.progress ? Math.max(0, data.progress.goal_abs_lp - data.progress.current_abs_lp) : null

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
            </section>

            <section className='panel'>
                <h3 className='panel-title'>Rank over time</h3>
                <LpChart snapshots={data.snapshots} goalAbs={data.goal?.target_abs_lp} />
            </section>

            <section className='panel goal-form-panel'>
                <h3 className='panel-title'>Set a goal</h3>
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
                    <Button disabled={saving}>{saving ? 'Saving…' : 'Set goal'}</Button>
                </form>
            </section>
        </div>
    )
}
