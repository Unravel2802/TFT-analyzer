from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.repositories.journal import list_notes, upsert_note, delete_note
from app.schemas.journal import NoteRequest, NoteEntry

router = APIRouter(prefix="/me/journal", tags=["journal"])


@router.get("", response_model=list[NoteEntry])
def get_journal(current_user: dict = Depends(get_current_user)):
    return list_notes(current_user["id"])


@router.put("/{match_id}")
def put_note(match_id: str, body: NoteRequest, current_user: dict = Depends(get_current_user)):
    upsert_note(current_user["id"], match_id, body.note)
    return {"status": "ok"}


@router.delete("/{match_id}")
def remove_note(match_id: str, current_user: dict = Depends(get_current_user)):
    delete_note(current_user["id"], match_id)
    return {"status": "ok"}