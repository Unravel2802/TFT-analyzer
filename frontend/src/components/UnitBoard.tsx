import type { MatchUnit } from '../types/tft'
import { championIcon, championCost, itemIcon } from '../data/champions'

export default function UnitBoard({ units }: { units: MatchUnit[] }) {
    return (
        <div className='board-units'>
            {units.map((u, i) => {
                const icon = championIcon(u.id)
                if (!icon) return null
                const cost = championCost(u.id) ?? 1
                return (
                    <div key={i} className='board-unit'>
                        <span className='unit-stars'>{'★'.repeat(u.tier)}</span>
                        <div className={`unit-portrait cost-${cost}`} title={u.id}>
                            <img className='portrait-img' src={icon} alt={u.id} />
                        </div>
                        <div className='unit-items'>
                            {u.items.map((it, j) => {
                                const img = itemIcon(it)
                                return img
                                    ? <img key={j} className='item-icon' src={img} alt={it} title={it} />
                                    : null
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}