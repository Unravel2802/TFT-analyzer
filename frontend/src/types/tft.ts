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
    tactician_icon_url: string | null
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

export interface UnitStat {
    unit_id: string
    name: string
    games: number
    play_rate: number
    avg_placement: number
    top4_rate: number
}

export interface CompUnit {
    id: string
    items: string[]
}

export interface CompStat {
    name: string
    trait: string
    carries: string[]
    games: number
    play_rate: number
    avg_placement: number
    top4_rate: number
    win_rate: number
    core_units: CompUnit[]
    flex_units: CompUnit[]
}

export interface CoachStat {
    name: string
    games: number
    avg_placement: number
    meta_avg?: number | null   // ladder-wide avg for the same unit; absent for traits/items
}

export interface CoachPlaystyle {
    avg_level: number
    avg_last_stage: string    // "5-3"-style label for the average exit round
    avg_damage_dealt: number
    avg_gold_left: number
}

export interface CoachInsights {
    games_analyzed: number
    overall_avg_placement: number
    best_traits: CoachStat[]
    worst_traits: CoachStat[]
    best_units: CoachStat[]
    worst_units: CoachStat[]
    best_items: CoachStat[]
    worst_items: CoachStat[]
    playstyle: CoachPlaystyle | null
}

export interface RankPoint {
    abs_lp: number
    captured_at: string
}

export interface ClimbJourney {
    started_at: string
    start_abs_lp: number
    days_elapsed: number
    lp_gained: number
    lp_per_day: number | null   // null until the journey is a day old
    eta_days: number | null     // null when there's no positive pace to project
}

export interface ClimbData {
    current: { tier: string; division: string; lp: number; abs_lp: number }
    goal: {
        target_tier: string
        target_division: string
        target_abs_lp: number
        can_change: boolean
        locked_until: string
    } | null
    progress: { start_abs_lp: number; current_abs_lp: number; goal_abs_lp: number; percent: number } | null
    journey: ClimbJourney | null
    snapshots: RankPoint[]
}

export interface SessionsInsights {
    games_analyzed: number
    overall_avg_placement: number
    current_streak: { type: string; count: number } | null
    after_two_losses: { avg_placement: number; games: number } | null
    time_of_day: { part: string; avg_placement: number; games: number }[]
}

export interface NoteEntry {
    match_id: string
    note: string
    updated_at: string
}

export interface MyRank {
    riot_id: string
    region: string      // normalized platform code (NA1, EUW1, ...)
    puuid: string
    tier: string
    division: string
    lp: number
}

export interface LeaderboardEntry {
    rank: number
    game_name: string | null
    tag_line: string | null
    puuid: string
    tier: string
    league_points: number
    wins: number
    losses: number
}