from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.clients.riot import RiotClient
from app.config import get_settings
from app.repositories.journal import list_notes, upsert_note, delete_note
from app.schemas.journal import NoteRequest, NoteEntry, TagReport
from app.services.journal_service import build_tag_report
import httpx

router = APIRouter(prefix="/me/journal", tags=["journal"])
settings = get_settings()


@router.get("", response_model=list[NoteEntry])
def get_journal(current_user: dict = Depends(get_current_user)):
    return list_notes(current_user["id"])


@router.get("/report", response_model=TagReport)
async def get_tag_report(current_user: dict = Depends(get_current_user)):
    game_name, tag_line = current_user["riot_id"].split("#")
    riot_client = RiotClient(api_key=settings.riot_api_key, region=current_user["region"])
    try:
        return await build_tag_report(riot_client, current_user["id"], game_name, tag_line)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes")
        raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
    finally:
        await riot_client.close()


@router.put("/{match_id}")
def put_note(match_id: str, body: NoteRequest, current_user: dict = Depends(get_current_user)):
    upsert_note(current_user["id"], match_id, body.note, body.tags)
    return {"status": "ok"}


@router.delete("/{match_id}")
def remove_note(match_id: str, current_user: dict = Depends(get_current_user)):
    delete_note(current_user["id"], match_id)
    return {"status": "ok"}
