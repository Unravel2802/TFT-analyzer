import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyClimb, setClimbGoal } from './api'
import type { ClimbData, RankPoint } from '@/types/tft'
import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'
import LineChart from '@/components/charts/LineChart'
import { absLpToRank, rankTickLabel, rankGridValues } from '@/lib/rank'

const TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER']
const DIVISIONS = ['IV', 'III', 'II', 'I']

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function LpChart({ snapshots, goalAbs }: { snapshots: RankPoint[]; goalAbs?: number }) {
    if (snapshots.length === 0) {
        return <p className='muted'>No data yet — play a ranked game and check back.</p>
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

    if (loading) return <div className='page'><p className='page-tagline'>Loading your climb…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>
    if (!data) return null

    const c = data.current
    const rankLabel = c.tier === 'UNRANKED' ? 'Unranked' : `${c.tier} ${c.division} · ${c.lp} LP`

    return (
        <div className='page'>
            <h1 className='page-title'>Climb Tracker</h1>
            <p className='page-tagline'>Current: {rankLabel}</p>

            {data.progress && (
                <div className='climb-progress'>
                    <div className='climb-bar'>
                        <div className='climb-bar-fill' style={{ width: `${data.progress.percent}%` }} />
                    </div>
                    <p className='muted'>{data.progress.percent}% toward your goal</p>
                </div>
            )}

            <LpChart snapshots={data.snapshots} goalAbs={data.goal?.target_abs_lp} />

            <form className='climb-goal-form' onSubmit={saveGoal}>
                <span>Goal:</span>
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
        </div>
    )
}