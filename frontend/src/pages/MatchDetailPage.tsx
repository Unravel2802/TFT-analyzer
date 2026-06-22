import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMatchDetail } from '../api/tft'
import type { MatchDetail } from '../types/tft'
import { championIcon } from '../data/champions'

function placementClass(p: number): string {
    return p === 1 ? 'result-win' : p <= 4 ? 'result-top4' : 'result-bot4'
}

export default function MatchDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [data, setData] = useState<MatchDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError(null)
            try {
                setData(await getMatchDetail(id!))
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load match')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    if (loading) return <div className='page'><p className='status-next'>Loading match...</p></div>
    if (error) return <div className='page'><p className='error-text'>{error}</p></div>
    if (!data) return null

    return (
        <div className='page'>
            <h2 className='panel-title'>Match Detail</h2>
            <div className='match-boards'>
                {data.participants.map(part => (
                    <section key={part.puuid} className={`board-card ${placementClass(part.placement)}`}>
                        <div className='board-head'>
                            <span className='board-place'>#{part.placement}</span>
                            <span className='board-name'>{part.riot_id}</span>
                            <span className='board-level'>Lv {part.level}</span>
                        </div>
                        <div className='board-units'>
                            {part.units.map((u, i) => {
                                const icon = championIcon(u.id)
                                return (
                                    <div key={i} className='unit-icon-wrap' title={u.id}>
                                        {icon
                                            ? <img className='unit-icon' src={icon} alt={u.id} />
                                            : <span className='unit-fallback'>{u.id.split('_').pop()}</span>}
                                    </div>
                                )
                            })}
                        </div>
                        <div className='board-traits'>
                            {part.traits.map((t, i) => (
                                <span key={i} className={`trait-chip trait-style-${t.style}`}>
                                    {t.num_units} {t.name}
                                </span>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}