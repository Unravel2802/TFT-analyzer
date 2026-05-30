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
}