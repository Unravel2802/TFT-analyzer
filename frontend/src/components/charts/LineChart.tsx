import { useState } from 'react'
import { CHART } from './chartTheme'
import { makeScale } from './scale'

interface LineChartProps {
    values: number[]
    ariaLabel: string
    /** y domain; defaults to [min, max] of values (and referenceY if set) */
    yDomain?: [number, number]
    /** true when smaller is better — puts low values at the top (placement charts) */
    invertY?: boolean
    /** y values to draw hairline gridlines + tick labels at */
    gridValues?: number[]
    /** formats tooltip values and axis ticks */
    formatValue?: (v: number) => string
    /** axis tick text; defaults to formatValue */
    formatTick?: (v: number) => string
    /** tooltip secondary line for a point ("Game 3", "Jun 12") */
    xLabel?: (i: number) => string
    /** per-point dot color; defaults to the gold line color */
    dotColor?: (v: number, i: number) => string
    /** dashed horizontal reference line (e.g. a rank goal) */
    referenceY?: number
    /**
     * Second, dashed forecast series sharing the same x axis. Null-padded so
     * index i lines up with values[i]; to connect the ray to the solid line,
     * its first non-null entry should repeat the last real value.
     */
    projectionValues?: (number | null)[]
}

export default function LineChart({
    values,
    ariaLabel,
    yDomain,
    invertY,
    gridValues = [],
    formatValue = String,
    formatTick,
    xLabel,
    dotColor,
    referenceY,
    projectionValues,
}: LineChartProps) {
    const [hover, setHover] = useState<number | null>(null)
    // The x scale spans real points plus any projected ones.
    const n = Math.max(values.length, projectionValues?.length ?? 0)
    if (n === 0) return null

    const projPoints = (projectionValues ?? []).filter((v): v is number => v != null)
    const domainSource = [
        ...values,
        ...projPoints,
        ...(referenceY != null ? [referenceY] : []),
    ]
    const [lo, hi] = yDomain ?? [Math.min(...domainSource), Math.max(...domainSource)]
    const s = makeScale({ n, lo, hi, invertY })
    const tick = formatTick ?? formatValue

    const line = values.map((v, i) => `${s.x(i)},${s.y(v)}`).join(' ')
    const projLine = (projectionValues ?? [])
        .map((v, i) => (v == null ? null : `${s.x(i)},${s.y(v)}`))
        .filter(Boolean)
        .join(' ')

    // y value under the pointer, whichever series owns that index
    function valueAt(i: number): number | null {
        if (i < values.length) return values[i]
        return projectionValues?.[i] ?? null
    }

    // Map pointer position (CSS pixels) back into viewBox units, then snap to
    // the nearest data index — readers aim at an x position, not at a 2px line.
    function handleMove(e: React.PointerEvent<SVGSVGElement>) {
        const rect = e.currentTarget.getBoundingClientRect()
        const vx = ((e.clientX - rect.left) / rect.width) * s.W
        const i = n <= 1 ? 0 : Math.round(((vx - s.pad) / s.innerW) * (n - 1))
        setHover(Math.min(n - 1, Math.max(0, i)))
    }

    const hoverValue = hover != null ? valueAt(hover) : null

    return (
        <div className='chart-wrap'>
            <svg
                className='chart'
                viewBox={`0 0 ${s.W} ${s.H}`}
                role='img'
                aria-label={ariaLabel}
                onPointerMove={handleMove}
                onPointerLeave={() => setHover(null)}
            >
                <title>{ariaLabel}</title>

                {gridValues.map(v => (
                    <g key={v}>
                        <line
                            x1={s.pad} y1={s.y(v)} x2={s.W - s.pad} y2={s.y(v)}
                            stroke={CHART.grid} strokeWidth='1'
                        />
                        <text
                            x={s.pad - 6} y={s.y(v) + 3} textAnchor='end'
                            fontSize={CHART.fontSize} fill={CHART.tick}
                        >
                            {tick(v)}
                        </text>
                    </g>
                ))}

                {referenceY != null && (
                    <line
                        x1={s.pad} y1={s.y(referenceY)} x2={s.W - s.pad} y2={s.y(referenceY)}
                        stroke={CHART.line} strokeDasharray='4 3' strokeWidth='1'
                    />
                )}

                {hover != null && (
                    <line
                        x1={s.x(hover)} y1={s.pad} x2={s.x(hover)} y2={s.H - s.pad}
                        stroke={CHART.tick} strokeWidth='1'
                    />
                )}

                {projLine && (
                    <polyline
                        points={projLine} fill='none' stroke={CHART.line}
                        strokeWidth='2' strokeDasharray='6 5' opacity='0.55'
                        strokeLinejoin='round' strokeLinecap='round'
                    />
                )}

                <polyline
                    points={line} fill='none' stroke={CHART.line}
                    strokeWidth='2' strokeLinejoin='round' strokeLinecap='round'
                />

                {values.map((v, i) => (
                    <circle
                        key={i} cx={s.x(i)} cy={s.y(v)} r='4'
                        fill={dotColor ? dotColor(v, i) : CHART.line}
                        stroke={CHART.surface} strokeWidth='2'
                    >
                        <title>{formatValue(v)}</title>
                    </circle>
                ))}
            </svg>

            {hover != null && hoverValue != null && (
                <div
                    className='chart-tooltip'
                    style={{
                        left: `${(s.x(hover) / s.W) * 100}%`,
                        top: `${(s.y(hoverValue) / s.H) * 100}%`,
                    }}
                >
                    <span className='chart-tooltip-value'>{formatValue(hoverValue)}</span>
                    {xLabel && <span className='chart-tooltip-label'>{xLabel(hover)}</span>}
                </div>
            )}
        </div>
    )
}
