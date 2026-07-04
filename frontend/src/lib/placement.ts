// TFT placement semantics: 1st = win, 2nd–4th = top 4 (gains LP), 5th–8th = bottom 4.
export type PlacementBucket = 'win' | 'top4' | 'bot4'

export function placementBucket(p: number): PlacementBucket {
    return p === 1 ? 'win' : p <= 4 ? 'top4' : 'bot4'
}

// CSS custom property for chart fills/strokes (--win / --top4 / --bot4)
export function placementColor(p: number): string {
    return `var(--${placementBucket(p)})`
}

// class names matching App.css .result-* rules
export function placementClass(p: number): string {
    return `result-${placementBucket(p)}`
}

// 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th" ...
export function ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function resultLabel(p: number): string {
    return p === 1 ? 'Win' : p <= 4 ? 'Top 4' : ordinal(p)
}
