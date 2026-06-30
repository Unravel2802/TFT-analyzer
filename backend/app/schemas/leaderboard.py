from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int                  # 1-based ladder position
    game_name: str | None      # None if name lookup failed
    tag_line: str | None
    puuid: str
    tier: str                  # CHALLENGER / GRANDMASTER / MASTER
    league_points: int
    wins: int
    losses: int
