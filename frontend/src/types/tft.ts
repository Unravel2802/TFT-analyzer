// GET/players/{game_name}/{tag_line}
export interface Account {
    puuid: string;
    gameName: string;
    tagLine: string
}

export type UnitEntry = [string, number];
export type TraitEntry = [string, number];

export interface PlayerStats {
    avg_placement: number;
    top4_rate: string;
    win_rate: string;
    top_units: UnitEntry[];
    top_traits: TraitEntry[];
    tier: string
    rank: string
    lp: number
    riot_id: string
}

export interface MatchEntry {
    placement: number
    game_datetime: number
    units: string[]
    traits: string[]
}

export interface DashboardData extends PlayerStats {
    matches: MatchEntry[]
}