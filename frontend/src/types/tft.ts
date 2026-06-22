
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
    match_id: string
    placement: number
    game_datetime: number
    units: MatchUnit[]
    traits: MatchTrait[]
}

export interface DashboardData extends PlayerStats {
    matches: MatchEntry[]
}

export interface MatchUnit {
    id: string
    tier: number
    items: string[]
}

export interface MatchParticipant {
    riot_id: string
    puuid: string
    placement: number
    level: number
    units: MatchUnit[]
    traits: MatchTrait[];
}

export interface MatchDetail {
    match_id: string
    game_datetime: number
    participants: MatchParticipant[]
}

export interface MatchTrait {
    id: string
    num_units: number
    style: number
}