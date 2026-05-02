from fastapi import APIRouter
from app.services.riot_client import RiotClient
from app.config import get_settings

router = APIRouter(prefix="/players", tags=["players"])

settings = get_settings()
riot_client = RiotClient(api_key=settings.riot_api_key)

@router.get("/{game_name}/{tag_line}")
async def get_player(game_name: str, tag_line: str):
    response = await riot_client.get_account(game_name, tag_line)
    return response

