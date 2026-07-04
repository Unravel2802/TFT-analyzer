import { useState } from 'react'
import { championFace, championCost } from '@/lib/gameAssets'

// Champion face with cost-colored border and a text fallback when the
// CDN image 404s (new patch units often lag behind the image host).
export default function UnitPortrait({ id, cost }: { id: string; cost?: number }) {
    const [failed, setFailed] = useState(false)
    const c = cost ?? championCost(id) ?? 1
    const short = id.split('_').pop() ?? id
    return (
        <div className={`unit-portrait cost-${c}`} title={id}>
            {failed
                ? <div className='portrait-fallback'>{short}</div>
                : (
                    <img
                        className='portrait-img'
                        src={championFace(id)}
                        alt={short}
                        loading='lazy'
                        decoding='async'
                        onError={() => setFailed(true)}
                    />
                )}
        </div>
    )
}
