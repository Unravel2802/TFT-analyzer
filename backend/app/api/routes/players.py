import asyncio
from fastapi import APIRouter
from app.services.riot_client import RiotClient
from app.config import get_settings
from app.services.stats_service import StatsService

router = APIRouter(prefix="/players", tags=["players"])

settings = get_settings()

@router.get("/{region}/{game_name}/{tag_line}")
async def get_player(region: str, game_name: str, tag_line: str):
    riot_client = RiotClient(api_key=settings.riot_api_key, region=region)
    response = await riot_client.get_account(game_name, tag_line)
    return response

@router.get("/{region}/{game_name}/{tag_line}/stats")
async def get_player_stat(region: str, game_name: str, tag_line: str):
    riot_client = RiotClient(api_key=settings.riot_api_key, region=region)
    stat_service = StatsService(riot_client=riot_client)

    account = await riot_client.get_account(game_name, tag_line)
    puuid = account["puuid"]

    rank, stats = await asyncio.gather(
        stat_service.get_player_rank(puuid),
        stat_service.get_player_stats(puuid),
    )
    return {**stats, **rank}

