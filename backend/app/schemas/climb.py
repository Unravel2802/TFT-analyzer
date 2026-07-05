from pydantic import BaseModel


class RankPoint(BaseModel):
    abs_lp: int
    captured_at: str


class CurrentRank(BaseModel):
    tier: str
    division: str
    lp: int
    abs_lp: int


class ClimbGoal(BaseModel):
    target_tier: str
    target_division: str
    target_abs_lp: int
    can_change: bool
    locked_until: str


class ClimbProgress(BaseModel):
    start_abs_lp: int
    current_abs_lp: int
    goal_abs_lp: int
    percent: float


class ClimbJourney(BaseModel):
    started_at: str
    start_abs_lp: int
    days_elapsed: int
    lp_gained: int
    lp_per_day: float | None    # None until the journey is a day old
    eta_days: int | None        # None when there's no positive pace to project


class ClimbData(BaseModel):
    current: CurrentRank
    goal: ClimbGoal | None
    progress: ClimbProgress | None
    journey: ClimbJourney | None
    snapshots: list[RankPoint]

class GoalRequest(BaseModel):
    target_tier: str
    target_division: str = ""