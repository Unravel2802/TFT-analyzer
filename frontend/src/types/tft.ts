export type UnitEntry = [string, number];
export type TraitEntry = [string, number];

export interface MatchEntry {
    match_id: string
    placement: number
    game_datetime: number
    units: MatchUnit[]
    traits: MatchTrait[]
}

export interface DashboardData {
    riot_id: string
    tier: string
    rank: string
    lp: number
    avg_placement: number
    top4_rate: string
    win_rate: string
    top_units: UnitEntry[]
    top_traits: TraitEntry[]
    matches: MatchEntry[]
    profile_icon_url: string
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