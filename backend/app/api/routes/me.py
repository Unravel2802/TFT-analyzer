from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.clients.riot import RiotClient
from app.services.stats_service import StatsService
from app.services.dashboard_service import build_dashboard
from app.services.coach_service import build_coach
from app.schemas.coach import CoachInsights
from app.config import get_settings
import httpx

router = APIRouter(prefix="/me", tags=["me"])
settings = get_settings()

@router.get("/dashboard")
async def get_my_dashboard(current_user: dict = Depends(get_current_user)):
    game_name, tag_line = current_user["riot_id"].split("#")
    riot_client = RiotClient(api_key=settings.riot_api_key, region=current_user["region"])
    stats_service = StatsService(riot_client)
    try:
        return await build_dashboard(riot_client, stats_service, game_name, tag_line)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes")
        raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
    finally:
        await riot_client.close()

@router.get("/coach", response_model=CoachInsights)
async def get_my_coach(current_user: dict = Depends(get_current_user)):
    game_name, tag_line = current_user["riot_id"].split("#")
    riot_client = RiotClient(api_key=settings.riot_api_key, region=current_user["region"])
    try:
        return await build_coach(riot_client, game_name, tag_line)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes")
        raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
    finally:
        await riot_client.close()