from fastapi import APIRouter, HTTPException
from app.clients.riot import RiotClient
from app.services.stats_service import StatsService
from app.services.dashboard_service import build_dashboard
from app.config import get_settings
import asyncio
import httpx

router = APIRouter(prefix="/players", tags=["players"])
settings = get_settings()

@router.get("/{region}/{game_name}/{tag_line}/dashboard")
async def get_player_dashboard(region: str, game_name: str, tag_line: str):
    riot_client = RiotClient(api_key=settings.riot_api_key, region=region)
    stats_service = StatsService(riot_client)
    try:
        return await build_dashboard(riot_client, stats_service, game_name, tag_line)    
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes.")
        raise HTTPException(status_code = e.response.status_code, detail="Riot API error")
    finally:
        await riot_client.close()
