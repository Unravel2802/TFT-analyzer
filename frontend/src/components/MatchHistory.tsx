import type { MatchEntry } from '../types/tft'

function PlacementBadge({ placement }: { placement: number }) {
    const color = 
        placement === 1 ? '#C89B3C' : 
        placement <= 4 ? '#4caf50' : 
        '#e57373'
    
    return (
        <span className='placement-badge' style={{ color }}>
            #{placement}
        </span>
    )
}

function formatDate(ms: number): string {
    return new Date(ms).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

export default function MatchHistory({ matches }: {matches: MatchEntry[]}) {
    return (
        <div className='match-history'>
            <h3 className='match-history-title'>Match History</h3>
            {matches.map((match, i) => (
                <div key={i} className='match-row'>
                    <div className='match-left'>
                        <PlacementBadge placement={match.placement} />
                        <span className='match-date'>{formatDate(match.game_datetime)}</span>
                    </div>
                    <div className='match-right'>
                        <div className='match-tags'>
                            {match.units.map(u => (
                                <span key={u} className='match-tag unit-tag'>{u}</span>
                            ))}
                        </div>
                        <div className='match-tags'>
                            {match.traits.map(t => (
                                <span key={t} className='match-tag trait-tag'>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
)
}