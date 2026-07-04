import { useState } from 'react'
import { CHART } from './chartTheme'

export interface Bar {
    label: string
    value: number
    color?: string
}

interface BarChartProps {
    bars: Bar[]
    ariaLabel: string
    formatValue?: (v: number) => string
    /** bar heights scale to this; defaults to the largest value */
    max?: number
    /** print the value on each bar cap (tooltips still work) */
    showValues?: boolean
    /** tooltip secondary line; defaults to the bar's axis label */
    tooltipLabel?: (i: number) => string
}

// Rounded data-end (top), square at the baseline — per the mark spec.
function barPath(x: number, y: number, w: number, h: number, r: number): string {
    const rr = Math.min(r, w / 2, h)
    return [
        `M${x},${y + h}`,
        `L${x},${y + rr}`,
        `Q${x},${y} ${x + rr},${y}`,
        `L${x + w - rr},${y}`,
        `Q${x + w},${y} ${x + w},${y + rr}`,
        `L${x + w},${y + h}`,
        'Z',
    ].join(' ')
}

export default function BarChart({
    bars,
    ariaLabel,
    formatValue = String,
    max,
    showValues = false,
    tooltipLabel,
}: BarChartProps) {
    const [hover, setHover] = useState<number | null>(null)
    if (bars.length === 0) return null

    const { W, H, pad, fontSize } = CHART
    const innerW = W - pad * 2
    const innerH = H - pad * 2
    const maxV = max ?? Math.max(...bars.map(b => b.value), 1)
    const slot = innerW / bars.length
    const barW = Math.min(slot * 0.6, 24)

    return (
        <div className='chart-wrap'>
            <svg
                className='chart'
                viewBox={`0 0 ${W} ${H}`}
                role='img'
                aria-label={ariaLabel}
                onPointerLeave={() => setHover(null)}
            >
                <title>{ariaLabel}</title>

                {bars.map((b, i) => {
                    const h = (b.value / maxV) * innerH
                    const bx = pad + i * slot + (slot - barW) / 2
                    const by = pad + innerH - h
                    return (
                        <g key={i}>
                            {h > 0 && (
                                <path
                                    d={barPath(bx, by, barW, h, 3)}
                                    fill={b.color ?? CHART.line}
                                    opacity={hover === null || hover === i ? 1 : 0.55}
                                />
                            )}
                            {showValues && b.value > 0 && (
                                <text
                                    x={bx + barW / 2} y={by - 4} textAnchor='middle'
                                    fontSize={fontSize} fill={CHART.label}
                                >
                                    {formatValue(b.value)}
                                </text>
                            )}
                            <text
                                x={bx + barW / 2} y={H - pad + 12} textAnchor='middle'
                                fontSize={fontSize} fill={CHART.tick}
                            >
                                {b.label}
                            </text>
                            {/* hit target: the whole column, much bigger than the mark */}
                            <rect
                                x={pad + i * slot} y={pad} width={slot} height={innerH}
                                fill='transparent'
                                onPointerEnter={() => setHover(i)}
                            >
                                <title>{`${tooltipLabel ? tooltipLabel(i) : b.label}: ${formatValue(b.value)}`}</title>
                            </rect>
                        </g>
                    )
                })}
            </svg>

            {hover != null && (
                <div
                    className='chart-tooltip'
                    style={{
                        left: `${((pad + hover * slot + slot / 2) / W) * 100}%`,
                        top: `${((pad + innerH - (bars[hover].value / maxV) * innerH) / H) * 100}%`,
                    }}
                >
                    <span className='chart-tooltip-value'>{formatValue(bars[hover].value)}</span>
                    <span className='chart-tooltip-label'>
                        {tooltipLabel ? tooltipLabel(hover) : bars[hover].label}
                    </span>
                </div>
            )}
        </div>
    )
}
