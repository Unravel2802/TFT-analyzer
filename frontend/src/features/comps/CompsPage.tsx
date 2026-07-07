import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getCompsMeta, getMyComps } from './api'
import { itemIcon } from '@/lib/gameAssets'
import type { CompStat, CompUnit } from '@/types/tft'
import UnitPortrait from '@/components/UnitPortrait'
import Dropdown from '@/components/Dropdown'

type SortKey = 'avg_placement' | 'top4_rate' | 'win_rate' | 'play_rate' | 'games'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'avg_placement', label: 'Avg placement' },
    { value: 'top4_rate', label: 'Top 4 rate' },
    { value: 'win_rate', label: 'Win rate' },
    { value: 'play_rate', label: 'Play rate' },
    { value: 'games', label: 'Games' },
]

function CompUnitTile({ unit }: { unit: CompUnit }) {
    return (
        <div className='comp-unit'>
            <UnitPortrait id={unit.id} />
            {unit.items.length > 0 && (
                <div className='comp-unit-items'>
                    {unit.items.map((it, i) => {
                        const img = itemIcon(it)
                        return img
                            ? <img key={i} className='item-icon' src={img} alt={it} title={it} loading='lazy' decoding='async' />
                            : null
                    })}
                </div>
            )}
        </div>
    )
}

// A small horizontal meter reads much faster than a bare percentage.
function StatMeter({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className='stat-meter'>
            <span className='stat-meter-label'>{label}</span>
            <div className='stat-meter-track'>
                <div className='stat-meter-fill' style={{ width: `${Math.min(value, 100)}%`, background: color }} />
            </div>
            <span className='stat-meter-value'>{value}%</span>
        </div>
    )
}

function CompCard({ comp, rank, mine }: { comp: CompStat; rank: number; mine?: CompStat }) {
    return (
        <section className='comp-card'>
            <header className='comp-card-head'>
                <span className='comp-rank'>#{rank}</span>
                <h2 className='comp-name'>{comp.name}</h2>
                {mine && (
                    <span
                        className='comp-mine-badge'
                        title={`Your last games: ${mine.games} played, ${mine.avg_placement} avg placement`}
                    >
                        You've played this {mine.games}× · your avg {mine.avg_placement}
                    </span>
                )}
                <span className='comp-meta'>{comp.games} games · {comp.play_rate}% play rate</span>
            </header>
            <div className='comp-card-body'>
                <div className='comp-units'>
                    {comp.core_units.map(u => <CompUnitTile key={u.id} unit={u} />)}
                    {comp.flex_units.length > 0 && <span className='comp-flex-divider' />}
                    {comp.flex_units.map(u => (
                        <div key={u.id} className='comp-flex'>
                            <CompUnitTile unit={u} />
                        </div>
                    ))}
                </div>
                <div className='comp-stats'>
                    <div className='comp-avg'>
                        <span className='comp-avg-value'>{comp.avg_placement}</span>
                        <span className='comp-avg-label'>avg place</span>
                    </div>
                    <div className='comp-meters'>
                        <StatMeter label='Top 4' value={comp.top4_rate} color='var(--top4)' />
                        <StatMeter label='Win' value={comp.win_rate} color='var(--win)' />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function CompsPage() {
    const { token } = useAuth()
    const [comps, setComps] = useState<CompStat[]>([])
    const [mine, setMine] = useState<Map<string, CompStat> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortKey, setSortKey] = useState<SortKey>('avg_placement')

    useEffect(() => {
        let active = true
        getCompsMeta()
            .then(data => { if (active) setComps(data) })
            .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Failed to load') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    // Personal badges are additive: fetched only when signed in; comp `name` is
    // built the same way on both sides, so lookup is a straight Map hit.
    useEffect(() => {
        if (!token) return
        let active = true
        getMyComps(token)
            .then(data => { if (active) setMine(new Map(data.map(c => [c.name, c]))) })
            .catch(() => { /* badges simply don't render */ })
        return () => { active = false }
    }, [token])

    // lower avg placement is better; every other stat sorts high-first
    const sorted = [...comps].sort((a, b) =>
        sortKey === 'avg_placement' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
    )

    if (loading) return (
        <div className='page'>
            <h1 className='page-title'>Comps</h1>
            <div className='comp-list' aria-hidden='true'>
                {Array.from({ length: 4 }, (_, i) => <div key={i} className='skeleton skeleton-card' />)}
            </div>
        </div>
    )
    if (error) return (
        <div className='page'>
            <div className='error-box'><p className='error-text'>{error}</p></div>
        </div>
    )

    return (
        <div className='page'>
            <h1 className='page-title'>Comps</h1>
            <p className='page-tagline'>Best team comps across tracked games. Core units always play; flex units (dimmed) are situational.</p>

            <div className='comps-toolbar'>
                <span className='comps-toolbar-label'>Sort by</span>
                <Dropdown
                    options={SORT_OPTIONS}
                    value={sortKey}
                    onChange={v => setSortKey(v as SortKey)}
                />
            </div>

            <div className='comp-list'>
                {sorted.map((c, i) => (
                    <CompCard key={c.name} comp={c} rank={i + 1} mine={token ? mine?.get(c.name) : undefined} />
                ))}
            </div>
        </div>
    )
}
