import type { DashboardData } from '../types/tft'
import StatCard from './StatCard'
import TopList from './TopList'
import MatchHistory from './MatchHistory'

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
                    <div key={i} className={`placement-bubble ${colorClass}`}>
                        {p}
                    </div>
                )
            })}
        </div>
    )
}

export default function PlayerProfile({ data }: { data: DashboardData }) {
    return (
        <div className='results'>
            <div className='player-card'>
                <img
                    className='rank-emblem'
                    src={`https://opgg-static.akamaized.net/images/medals_new/${data.tier.toLowerCase()}.png`}
                    alt={data.tier}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className='player-name'>{data.riot_id.split('#')[0]}</div>
                <div className='rank-display' data-tier={data.tier.toLowerCase()}>
                    <span className='rank-tier'>{data.tier}</span>
                    {data.rank && <span className='rank-division'>{data.rank}</span>}
                    {data.tier !== 'UNRANKED' && <span className='rank-lp'>{data.lp} LP</span>}
                </div>
            </div>

            <PlacementGrid data={data} />

            <div className='stat-cards'>
                <StatCard label='Avg Placement' value={data.avg_placement.toFixed(2)} />
                <StatCard label='Top 4 Rate' value={data.top4_rate} />
                <StatCard label='Win Rate' value={data.win_rate} />
            </div>

            <div className='top-lists'>
                <TopList title='Top Units' entries={data.top_units} />
                <TopList title='Top Traits' entries={data.top_traits} />
            </div>

            <MatchHistory matches={data.matches} />
        </div>
    )
}