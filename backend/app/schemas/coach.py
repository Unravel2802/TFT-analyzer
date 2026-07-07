from pydantic import BaseModel


class CoachStat(BaseModel):
    name: str
    games: int
    avg_placement: float
    meta_avg: float | None = None   # ladder-wide avg for the same unit; None for traits/items


class CoachPlaystyle(BaseModel):
    avg_level: float          # board level when the game ends
    avg_last_stage: str       # "5-3"-style label for the average exit round
    avg_damage_dealt: int
    avg_gold_left: float


class CoachInsights(BaseModel):
    games_analyzed: int
    overall_avg_placement: float
    best_traits: list[CoachStat]
    worst_traits: list[CoachStat]
    best_units: list[CoachStat]
    worst_units: list[CoachStat]
    best_items: list[CoachStat]
    worst_items: list[CoachStat]
    playstyle: CoachPlaystyle | None