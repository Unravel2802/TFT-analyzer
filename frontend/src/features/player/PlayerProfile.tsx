import type { DashboardData } from '@/types/tft'
import StatCard from './StatCard'
import TopList from './TopList'
import MatchHistory from './MatchHistory'
import PlacementTrend from './PlacementTrend'
import PlacementDistribution from './PlacementDistribution'

function PlacementGrid({ data }: { data: DashboardData }) {
    return (
        <div className='placement-grid'>
            {data.matches.map((match, i) => {
                const p = match.placement
                const colorClass =
                    p === 1 ? 'bubble-first' :
                    p <= 4  ? 'bubble-top4' :
                    'bubble-bot4'
                return (
                    <div key={i} className={`placement-bubble ${colorClass}`}>{p}</div>
                )
            })}
        </div>
    )
}

export default function PlayerProfile({ data }: { data: DashboardData }) {
    const hasMatches = data.matches.length > 0
    const top4Count = data.matches.filter(m => m.placement <= 4).length
    const winCount = data.matches.filter(m => m.placement === 1).length
    const tierLabel = data.tier.charAt(0) + data.tier.slice(1).toLowerCase()
    return (
        <div className='profile'>
            <header className='hero'>
                <div className='identity-card' data-tier={data.tier.toLowerCase()}>
                    <img
                        className='rank-emblem'
                        src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${data.tier.toLowerCase()}.png`}
                        alt={data.tier}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
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
                        <h3 className='stats-panel-title'>
                            Recent {data.matches.length} Matches <span className='muted'>(Ranked)</span>
                        </h3>
                        <div className='hero-stats'>
                            <StatCard label='Avg.' value={data.avg_placement.toFixed(2)} />
                            <StatCard label='Top 4' value={top4Count} />
                            <StatCard label='Won' value={winCount} />
                        </div>
                    </div>
                )}
            </header>

            {hasMatches ? (<div className='profile-grid'>
                <main className='profile-main'>
                    <section className='panel'>
                        <h3 className='panel-title'>Recent Form</h3>
                        <PlacementGrid data={data} />
                    </section>

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