from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user
from app.services.riot_client import RiotClient
from app.services.stats_service import StatsService
from app.config import get_settings
import asyncio

router = APIRouter(prefix="/me", tags=["me"])
settings = get_settings()

@router.get("/stats")
async def get_my_stats(current_user: dict = Depends(get_current_user)):
    riot_id = current_user["riot_id"]
    region = current_user["region"]

    game_name, tag_line= riot_id.split("#")

    riot_client = RiotClient(api_key=settings.riot_api_key, region=region)

    try: 
        account = await riot_client.get_account(game_name, tag_line)
        puuid = account["puuid"]

        stats_service = StatsService(riot_client)
        stats, rank = await asyncio.gather(
            stats_service.get_player_stats(puuid),
            stats_service.get_player_rank(puuid),
        )

        return {**stats, ** rank, "riot_id": current_user["riot_id"]}
    finally:
        await riot_client.close()