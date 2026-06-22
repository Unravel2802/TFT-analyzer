import { useState } from 'react'
import type { MatchEntry } from '@/types/tft'
import { Link } from 'react-router-dom'
import UnitBoard from '@/components/UnitBoard'
import TraitRow from '@/components/TraitRow'

function formatDate(ms: number): string {
    return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th" ...
function ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function resultClass(p: number): string {
    return p === 1 ? 'result-win' : p <= 4 ? 'result-top4' : 'result-bot4'
}

function MatchRow({ match }: { match: MatchEntry }) {
    const [open, setOpen] = useState(false)
    const p = match.placement
    const label = p === 1 ? 'Win' : p <= 4 ? 'Top 4' : ordinal(p)

    return (
        <div className={`match-row ${resultClass(p)}`}>
            <button
                className='match-summary'
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
            >
                <span className='placement-badge'>#{p}</span>
                <span className='match-result'>{label}</span>
                <span className='match-date'>{formatDate(match.game_datetime)}</span>
                <span className='match-unit-count'>{match.units.length} units</span>
                <span className={`match-chevron ${open ? 'open' : ''}`}>▾</span>
            </button>

            {open && (
                <div className='match-detail'>
                    <UnitBoard units={match.units} />
                    <TraitRow traits={match.traits} />
                    <Link className='match-fulllink' to={`/matches/${match.match_id}`}>
                        View full game →
                    </Link>
                </div>
            )}
        </div>
    )
}

export default function MatchHistory({ matches }: { matches: MatchEntry[] }) {
    return (
        <div className='match-history'>
            <h3 className='match-history-title'>Match History</h3>
            {matches.map((match, i) => (
                <MatchRow key={i} match={match} />
            ))}
        </div>
    )
}