from pydantic import BaseModel


class CoachStat(BaseModel):
    name: str
    games: int
    avg_placement: float


class CoachInsights(BaseModel):
    games_analyzed: int
    overall_avg_placement: float
    best_traits: list[CoachStat]
    worst_traits: list[CoachStat]
    best_units: list[CoachStat]
    worst_units: list[CoachStat]