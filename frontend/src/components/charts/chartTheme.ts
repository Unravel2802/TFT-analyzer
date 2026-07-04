// Shared chart geometry and chrome. All values are viewBox units — the SVG
// scales to its container via CSS (.chart), so these are proportions, not pixels.
export const CHART = {
    W: 320,
    H: 140,
    pad: 24,
    fontSize: 9,
    // chrome colors (recessive — the data is the only loud thing)
    grid: 'var(--border)',
    tick: 'var(--text-muted)',
    label: 'var(--text-bright)',
    line: 'var(--gold)',
    // dots and bar gaps are separated by the surface color, not by strokes
    surface: 'var(--bg-card)',
} as const
