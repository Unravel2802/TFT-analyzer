import { CHART } from './chartTheme'

// A chart is two affine maps: data index → x pixel, data value → y pixel.
// Everything drawn (lines, dots, bars, gridlines) is positioned by these.
export interface Scale {
    W: number
    H: number
    pad: number
    innerW: number
    innerH: number
    x: (i: number) => number
    y: (v: number) => number
}

export function makeScale(opts: {
    n: number // number of points along x
    lo: number // y domain min
    hi: number // y domain max
    invertY?: boolean // true when smaller is better (placement: 1st belongs at the top)
}): Scale {
    const { W, H, pad } = CHART
    const innerW = W - pad * 2
    const innerH = H - pad * 2
    const { n, lo, invertY } = opts
    const range = opts.hi - lo || 1 // avoid /0 when all values are equal

    const x = (i: number) => (n <= 1 ? pad + innerW / 2 : pad + (i / (n - 1)) * innerW)

    const y = (v: number) => {
        const t = (v - lo) / range // 0 at lo, 1 at hi
        return invertY ? pad + t * innerH : pad + (1 - t) * innerH
    }

    return { W, H, pad, innerW, innerH, x, y }
}
