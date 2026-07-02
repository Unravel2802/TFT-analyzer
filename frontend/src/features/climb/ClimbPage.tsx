import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyClimb, setClimbGoal } from './api'
import type { ClimbData, RankPoint } from '@/types/tft'
import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'

const TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER']
const DIVISIONS = ['IV', 'III', 'II', 'I']

function LpChart({ snapshots, goalAbs }: { snapshots: RankPoint[]; goalAbs?: number }) {
    const vals = snapshots.map(s => s.abs_lp)
    if (vals.length === 0) return <p className='muted'>No data yet — play a ranked game and check back.</p>

    const all = goalAbs != null ? [...vals, goalAbs] : vals
    const lo = Math.min(...all), hi = Math.max(...all)
    const range = hi - lo || 1
    const W = 320, H = 140, pad = 24
    const innerW = W - pad * 2, innerH = H - pad * 2
    const n = vals.length
    const x = (i: number) => (n <= 1 ? pad + innerW / 2 : pad + (i / (n - 1)) * innerW)
    const y = (v: number) => pad + (1 - (v - lo) / range) * innerH   // higher LP → top

    return (
        <svg className='chart' viewBox={`0 0 ${W} ${H}`}>
            {goalAbs != null && (
                <line x1={pad} y1={y(goalAbs)} x2={W - pad} y2={y(goalAbs)}
                      stroke='var(--gold)' strokeDasharray='4 3' strokeWidth='1' />
            )}
            <polyline points={vals.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
                      fill='none' stroke='var(--gold)' strokeWidth='2'
                      strokeLinejoin='round' strokeLinecap='round' />
            {vals.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r='3' fill='var(--win)' />)}
        </svg>
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