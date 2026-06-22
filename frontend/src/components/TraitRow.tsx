import type { MatchTrait } from '../types/tft'
import { traitIcon } from '../data/champions'

export default function TraitRow({ traits }: { traits: MatchTrait[] }) {
    return (
        <div className='trait-row'>
            {traits.map((t, i) => {
                const icon = traitIcon(t.id)
                if (!icon) return null
                return (
                    <span key={i} className={`trait-badge trait-style-${t.style}`} title={t.id}>
                        <img className='trait-icon' src={icon} alt={t.id} />
                        <span className='trait-count'>{t.num_units}</span>
                    </span>
                )
            })}
        </div>
    )
}