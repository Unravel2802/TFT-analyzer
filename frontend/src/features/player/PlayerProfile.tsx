import type { DashboardData } from '@/types/tft'
import StatCard from './StatCard'
import TopList from './TopList'
import MatchHistory from './MatchHistory'
import PlacementTrend from './PlacementTrend'
import PlacementDistribution from './PlacementDistribution'
import { placementBucket } from '@/lib/placement'

// "3h ago" / "2d ago" from a game_datetime in epoch milliseconds.
function relativeTime(ms: number): string {
    const mins = Math.floor((Date.now() - ms) / 60000)
    if (mins < 60) return `${Math.max(mins, 1)}m ago`
    if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`
    return `${Math.floor(mins / (60 * 24))}d ago`
}

// Matches arrive newest-first: the streak is the run length of consecutive
// top-4 (or bottom-4) finishes starting from the most recent game.
function currentStreak(matches: DashboardData['matches']) {
    if (matches.length === 0) return null
    const top4 = matches[0].placement <= 4
    let count = 0
    for (const m of matches) {
        if ((m.placement <= 4) === top4) count++
        else break
    }
    return { top4, count }
}

function PlacementGrid({ data }: { data: DashboardData }) {
    return (
        <div className='placement-grid'>
            {data.matches.map((match, i) => (
                <div key={i} className={`placement-bubble bubble-${placementBucket(match.placement)}`}>
                    {match.placement}
                </div>
            ))}
        </div>
    )
}

export default function PlayerProfile({ data }: { data: DashboardData }) {
    const hasMatches = data.matches.length > 0
    const top4Count = data.matches.filter(m => m.placement <= 4).length
    const winCount = data.matches.filter(m => m.placement === 1).length
    const tierLabel = data.tier.charAt(0) + data.tier.slice(1).toLowerCase()

    // Recent form: last-5 average vs the full-window average. Lower placement
    // is better, so a negative delta means the player is trending up.
    const last5 = data.matches.slice(0, 5)
    const last5Avg = hasMatches
        ? last5.reduce((sum, m) => sum + m.placement, 0) / last5.length
        : 0
    const formDelta = last5Avg - data.avg_placement
    const formTone = formDelta <= -0.3 ? 'good' : formDelta >= 0.3 ? 'bad' : undefined
    const streak = currentStreak(data.matches)
    return (
        <div className='profile'>
            <header className='hero'>
                <div className='identity-card' data-tier={data.tier.toLowerCase()}>
                    <div className='crest'>
                        <img
                            key={data.tier}
                            className='rank-emblem'
                            src={`https://opgg-static.akamaized.net/images/medals_new/${data.tier.toLowerCase()}.png`}
                            alt={data.tier}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        {data.tactician_icon_url && (
                            <img className='tactician-icon' src={data.tactician_icon_url} alt='Tactician' />
                        )}
                        {data.profile_icon_url && (
                            <img className='profile-icon' src={data.profile_icon_url} alt='Profile icon' />
                        )}
                    </div>
                    <div className='identity-overlay'>
                        <div className='player-name'>{data.riot_id.split('#')[0]}</div>
                        <div className='rank-line'>
                            {data.tier === 'UNRANKED'
                                ? 'Unranked'
                                : `${tierLabel} ${data.rank} ${data.lp}LP`}
                        </div>
                    </div>
                </div>

                {hasMatches && (
                    <div className='stats-panel'>
                        <div className='stats-panel-head'>
                            <h3 className='stats-panel-title'>
                                Recent {data.matches.length} Matches <span className='muted'>(Ranked)</span>
                            </h3>
                            <div className='stats-panel-meta'>
                                {streak && streak.count >= 2 && (
                                    <span className={`streak-chip ${streak.top4 ? 'streak-top4' : 'streak-bot4'}`}>
                                        {streak.top4 ? '🔥' : '🧊'} {streak.count} {streak.top4 ? 'top-4s' : 'bot-4s'} in a row
                                    </span>
                                )}
                                <span className='last-played'>last played {relativeTime(data.matches[0].game_datetime)}</span>
                            </div>
                        </div>
                        <PlacementGrid data={data} />
                        <div className='hero-stats'>
                            <StatCard label='Avg.' value={data.avg_placement.toFixed(2)} />
                            <StatCard
                                label='Last 5 Avg.'
                                value={last5Avg.toFixed(2)}
                                tone={formTone}
                            />
                            <StatCard label='Top 4' value={top4Count} />
                            <StatCard label='Won' value={winCount} />
                        </div>
                    </div>
                )}
            </header>

            {hasMatches ? (<div className='profile-grid'>
                <main className='profile-main'>
                    <section className='panel'>
                        <h3 className='panel-title'>Performance</h3>
                        <div className='charts'>
                            <div className='chart-block'>
                                <span className='chart-label'>Placement Trend (old → new)</span>
                                <PlacementTrend matches={data.matches} />
                            </div>
                            <div className='chart-block'>
                                <span className='chart-label'>Distribution</span>
                                <PlacementDistribution matches={data.matches} />
                            </div>
                        </div>
                    </section>

                    <section className='panel'>
                        <MatchHistory matches={data.matches} />
                    </section>
                </main>
                <aside className='profile-side'>
                    <TopList title='Top Units' entries={data.top_units} />
                    <TopList title='Top Traits' entries={data.top_traits} />
                </aside>
            </div>) : (
                <div className='panel empty-state'>
                    <p className='empty-title'>No ranked games</p>
                    <p className='empty-sub'>Play some ranked TFT and your stats will show up here.</p>
                </div>
            )}
        </div>
    )
}