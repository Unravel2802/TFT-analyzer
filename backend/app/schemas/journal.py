from pydantic import BaseModel, Field


class NoteRequest(BaseModel):
    note: str
    tags: list[str] = Field(default_factory=list, max_length=8)


class NoteEntry(BaseModel):
    match_id: str
    note: str
    tags: list[str] = Field(default_factory=list)
    updated_at: str


class TagStat(BaseModel):
    tag: str
    games: int
    avg_placement: float


class TagReport(BaseModel):
    games_analyzed: int              # noted games with a resolvable placement
    overall_avg_placement: float     # your baseline across those games
    tags: list[TagStat]              # costliest tag first
