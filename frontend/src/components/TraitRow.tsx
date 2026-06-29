import type { MatchTrait } from '@/types/tft'
import { traitIcon } from '../lib/gameAssets'

export default function TraitRow({ traits }: { traits: MatchTrait[] }) {
    return (
        <div className='trait-row'>
            {traits.map((t, i) => {
                const icon = traitIcon(t.id)
                if (!icon) return null
                return (
                    <span key={i} className={`trait-badge trait-style-${t.style}`} title={t.id}>
                        <img className='trait-icon' src={icon} alt={t.id} loading='lazy' decoding='async' />
                        <span className='trait-count'>{t.num_units}</span>
                    </span>
                )
            })}
        </div>
    )
}