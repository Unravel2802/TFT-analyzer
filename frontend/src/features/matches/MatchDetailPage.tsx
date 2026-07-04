import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMatchDetail } from '@/features/matches/api'
import type { MatchDetail } from '@/types/tft'
import UnitBoard from '@/components/UnitBoard'
import TraitRow from '@/components/TraitRow'
import MatchNote from '@/features/journal/MatchNote'
import { placementClass } from '@/lib/placement'

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

    if (loading) return <div className='page'><p className='status-text'>Loading match...</p></div>
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
                        <UnitBoard units={part.units} />
                        <TraitRow traits={part.traits} />
                    </section>
                ))}
            </div>
            <div>
            {   id && <MatchNote matchId={id} />}
            </div>
        </div>
    )
}