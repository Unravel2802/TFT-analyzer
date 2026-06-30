from fastapi import APIRouter, HTTPException
import httpx
from app.clients.riot import RiotClient
from app.services.leaderboard_service import build_leaderboard
from app.services.cache import async_ttl_cached
from app.schemas.leaderboard import LeaderboardEntry
from app.config import get_settings

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])
settings = get_settings()
_TTL = 300


@router.get("/{region}", response_model=list[LeaderboardEntry])
async def get_leaderboard(region: str, limit: int = 25):
    rc = RiotClient(api_key=settings.riot_api_key, region=region)
    try:
        return await async_ttl_cached(
            ("leaderboard", rc.region, limit), _TTL,
            lambda: build_leaderboard(rc, limit=limit),
        )
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes.")
        raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
    finally:
        await rc.close()
