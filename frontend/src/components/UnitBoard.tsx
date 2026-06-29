import { useState } from 'react'
import type { MatchUnit } from '@/types/tft'
import { championFace, championCost, itemIcon } from '../lib/gameAssets'

function shortName(id: string): string {
    return id.split('_').pop() ?? id
}

function UnitPortrait({ id, cost }: { id: string; cost: number }) {
    const [failed, setFailed] = useState(false)
    return (
        <div className={`unit-portrait cost-${cost}`} title={id}>
            {failed
                ? <div className='portrait-fallback'>{shortName(id)}</div>
                : <img className='portrait-img' src={championFace(id)} alt={id} loading='lazy' decoding='async' onError={() => setFailed(true)} />}
        </div>
    )
}

export default function UnitBoard({ units }: { units: MatchUnit[] }) {
    return (
        <div className='board-units'>
            {units.map((u, i) => {
                const cost = championCost(u.id) ?? 1
                return (
                    <div key={i} className='board-unit'>
                        <span className='unit-stars'>{'★'.repeat(u.tier)}</span>
                        <UnitPortrait id={u.id} cost={cost} />
                        <div className='unit-items'>
                            {u.items.map((it, j) => {
                                const img = itemIcon(it)
                                return img
                                    ? <img key={j} className='item-icon' src={img} alt={it} title={it} loading='lazy' decoding='async' />
                                    : null
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}