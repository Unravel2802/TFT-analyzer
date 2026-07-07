from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.clients.riot import RiotClient
from app.services.stats_service import StatsService
from app.services.dashboard_service import build_dashboard
from app.services.coach_service import build_coach
from app.services.player_lookup import fetch_user_participants
from app.services.units_meta_service import compute_unit_stats
from app.services.comps_meta_service import compute_comp_stats
from app.schemas.coach import CoachInsights
from app.schemas.meta import UnitStat, CompStat
from app.config import get_settings
from app.schemas.climb import ClimbData, GoalRequest
from app.services.climb_service import build_climb, set_goal, clear_goal, GoalLockedError
from app.services.session_service import build_sessions
from app.schemas.session import SessionsInsights
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

@router.get("/units", response_model=list[UnitStat])
async def get_my_units(current_user: dict = Depends(get_current_user)):
    """The signed-in user's own per-unit stats — same shape as /meta/units, so the
    Units page can join the two lists by unit_id."""
    game_name, tag_line = current_user["riot_id"].split("#")
    riot_client = RiotClient(api_key=settings.riot_api_key, region=current_user["region"])
    try:
        participants = await fetch_user_participants(riot_client, game_name, tag_line)
        return compute_unit_stats(participants, min_games=1)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes")
        raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
    finally:
        await riot_client.close()

@router.get("/comps", response_model=list[CompStat])
async def get_my_comps(current_user: dict = Depends(get_current_user)):
    """The signed-in user's own comp stats, keyed by the same comp `name` the
    /meta/comps table builds, so the Comps page can badge comps you've piloted."""
    game_name, tag_line = current_user["riot_id"].split("#")
    riot_client = RiotClient(api_key=settings.riot_api_key, region=current_user["region"])
    try:
        participants = await fetch_user_participants(riot_client, game_name, tag_line)
        return compute_comp_stats(participants, min_games=1)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes")
        raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
    finally:
        await riot_client.close()

@router.get("/climb", response_model=ClimbData)
async def get_my_climb(current_user: dict = Depends(get_current_user)):
    game_name, tag_line = current_user["riot_id"].split("#")
    riot_client = RiotClient(api_key=settings.riot_api_key, region=current_user["region"])
    stats_service = StatsService(riot_client)
    try:
        return await build_climb(riot_client, stats_service, current_user["id"], game_name, tag_line)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes")
        raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
    finally:
        await riot_client.close()

@router.post("/climb/goal")
async def set_my_climb_goal(body: GoalRequest, current_user: dict = Depends(get_current_user)):
    try:
        await set_goal(current_user["id"], body.target_tier, body.target_division)
    except GoalLockedError as e:
        raise HTTPException(status_code=409, detail=f"Goal is locked until {e.locked_until}")
    return {"status": "ok"}

@router.delete("/climb/goal")
async def reset_my_climb_goal(current_user: dict = Depends(get_current_user)):
    await clear_goal(current_user["id"])
    return {"status": "ok"}

@router.get("/sessions", response_model=SessionsInsights)
async def get_my_sessions(tz_offset: int = 0, current_user: dict = Depends(get_current_user)):
    game_name, tag_line = current_user["riot_id"].split("#")
    riot_client = RiotClient(api_key=settings.riot_api_key, region=current_user["region"])
    try:
        return await build_sessions(riot_client, game_name, tag_line, tz_offset_minutes=tz_offset)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes")
        raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
    finally:
        await riot_client.close()