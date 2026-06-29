from pydantic import BaseModel


class StreakInfo(BaseModel):
    type: str
    count: int


class AfterLosses(BaseModel):
    avg_placement: float
    games: int


class TimeBucket(BaseModel):
    part: str
    avg_placement: float
    games: int


class SessionsInsights(BaseModel):
    games_analyzed: int
    overall_avg_placement: float
    current_streak: StreakInfo | None
    after_two_losses: AfterLosses | None
    time_of_day: list[TimeBucket]