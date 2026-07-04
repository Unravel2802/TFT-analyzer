// Canonical region list. The backend normalizes any alias case-insensitively
// (see backend REGION_ALIASES), so the lowercase alias is safe to send to
// every endpoint: player search, leaderboard, and signup.
export interface Region {
    alias: string // value sent to the API
    label: string
    defaultTag: string // most common Riot ID tagline for the region
}

export const REGIONS: Region[] = [
    { alias: 'na', label: 'NA', defaultTag: 'NA1' },
    { alias: 'euw', label: 'EUW', defaultTag: 'EUW' },
    { alias: 'eune', label: 'EUNE', defaultTag: 'EUNE' },
    { alias: 'kr', label: 'KR', defaultTag: 'KR1' },
    { alias: 'br', label: 'BR', defaultTag: 'BR1' },
    { alias: 'lan', label: 'LAN', defaultTag: 'LAN' },
    { alias: 'las', label: 'LAS', defaultTag: 'LAS' },
    { alias: 'oce', label: 'OCE', defaultTag: 'OCE' },
    { alias: 'tr', label: 'TR', defaultTag: 'TR1' },
    { alias: 'ru', label: 'RU', defaultTag: 'RU' },
    { alias: 'jp', label: 'JP', defaultTag: 'JP1' },
    { alias: 'sg', label: 'SG', defaultTag: 'SG2' },
]

// Ready-made options for the Dropdown component
export const REGION_OPTIONS = REGIONS.map(r => ({ value: r.alias, label: r.label }))

export function defaultTagFor(alias: string): string {
    return REGIONS.find(r => r.alias === alias)?.defaultTag ?? alias.toUpperCase()
}
