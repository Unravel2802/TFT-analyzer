import type { MatchUnit } from '@/types/tft'
import { itemIcon } from '../lib/gameAssets'
import UnitPortrait from './UnitPortrait'

export default function UnitBoard({ units }: { units: MatchUnit[] }) {
    return (
        <div className='board-units'>
            {units.map((u, i) => {
                return (
                    <div key={i} className='board-unit'>
                        <span className='unit-stars'>{'★'.repeat(u.tier)}</span>
                        <UnitPortrait id={u.id} />
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