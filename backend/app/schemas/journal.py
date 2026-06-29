from pydantic import BaseModel


class NoteRequest(BaseModel):
    note: str


class NoteEntry(BaseModel):
    match_id: str
    note: str
    updated_at: str