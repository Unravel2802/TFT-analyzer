from fastapi import APIRouter
from app.services.riot_client import RiotClient
from app.config import get_settings
from app.services.stats_service import StatsService

router = APIRouter(prefix="/players", tags=["players"])

settings = get_settings()
riot_client = RiotClient(api_key=settings.riot_api_key)
stat_service = StatsService(riot_client=riot_client)

@router.get("/{game_name}/{tag_line}")
async def get_player(game_name: str, tag_line: str):
    response = await riot_client.get_account(game_name, tag_line)
    return response

@router.get("/{game_name}/{tag_line}/stats")
async def get_player_stat(game_name: str, tag_line: str):
    account = await riot_client.get_account(game_name, tag_line)
    puuid = account["puuid"]
    response = await stat_service.get_player_stats(puuid)
    return response 
