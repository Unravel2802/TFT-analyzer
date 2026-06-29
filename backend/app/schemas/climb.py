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


class ClimbProgress(BaseModel):
    start_abs_lp: int
    current_abs_lp: int
    goal_abs_lp: int
    percent: float


class ClimbData(BaseModel):
    current: CurrentRank
    goal: ClimbGoal | None
    progress: ClimbProgress | None
    snapshots: list[RankPoint]

class GoalRequest(BaseModel):
    target_tier: str
    target_division: str = ""