from pydantic import BaseModel

class UnitStat(BaseModel):
    unit_id: str
    name: str
    games: int
    play_rate: float
    avg_placement: float
    top4_rate: float

    