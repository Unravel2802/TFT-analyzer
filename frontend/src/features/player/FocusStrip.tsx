import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { getMySessions } from '@/features/sessions/api'
import { getMyClimb } from '@/features/climb/api'
import { getMyCoach } from '@/features/coach/api'
import type { CoachStat, ClimbJourney, SessionsInsights } from '@/types/tft'

// The single worst pick across traits and units — same rule as Coach's
// "Biggest leak" takeaway, so the two never disagree.
function worstOf(traits: CoachStat[], units: CoachStat[]): CoachStat | null {
    const all = [...traits, ...units]
    if (all.length === 0) return null
    return all.reduce((worst, s) => (s.avg_placement > worst.avg_placement ? s : worst))
}

function Chip({ to, label, value }: { to: string; label: string; value: string }) {
    return (
        <Link to={to} className='focus-chip'>
            <span className='focus-chip-value'>{value}</span>
            <span className='focus-chip-label'>{label}</span>
        </Link>
    )
}

// One glanceable fact from each differentiator page (Sessions, Climb, Coach),
// so the dashboard ties the app together instead of mirroring PlayerProfile.
// Every call is independent and failure-tolerant: no goal set, no games, or a
// rate limit just means that chip stays hidden.
export default function FocusStrip() {
    const { token } = useAuth()
    const [streak, setStreak] = useState<SessionsInsights['current_streak']>(null)
    const [journey, setJourney] = useState<ClimbJourney | null>(null)
    const [leak, setLeak] = useState<CoachStat | null>(null)

    useEffect(() => {
        if (!token) return
        let active = true
        getMySessions(token, new Date().getTimezoneOffset())
            .then(s => { if (active) setStreak(s.current_streak) })
            .catch(() => {})
        getMyClimb(token)
            .then(c => { if (active) setJourney(c.journey) })
            .catch(() => {})
        getMyCoach(token)
            .then(c => { if (active) setLeak(worstOf(c.worst_traits, c.worst_units)) })
            .catch(() => {})
        return () => { active = false }
    }, [token])

    const chips = []
    if (streak && streak.count >= 2) {
        chips.push(
            <Chip
                key='streak'
                to='/sessions'
                label={streak.type === 'win' ? 'Top-4 streak' : 'Bot-4 streak'}
                value={`${streak.count} games`}
            />,
        )
    }
    if (journey) {
        chips.push(
            <Chip
                key='climb'
                to='/climb'
                label='Climb pace'
                value={journey.eta_days === 0
                    ? 'Goal reached 🎉'
                    : journey.eta_days != null
                        ? `~${journey.eta_days}d to goal`
                        : journey.lp_per_day != null
                            ? `${Math.round(journey.lp_per_day)} LP/day`
                            : `Day ${journey.days_elapsed + 1}`}
            />,
        )
    }
    if (leak) {
        chips.push(
            <Chip key='leak' to='/coach' label='Biggest leak' value={`${leak.name} · ${leak.avg_placement} avg`} />,
        )
    }

    if (chips.length === 0) return null
    return <div className='focus-strip'>{chips}</div>
}
