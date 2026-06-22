import asyncio
import httpx 
from fastapi import APIRouter, HTTPException
from app.services.riot_client import RiotClient 
from app.services.match_cache import get_cached_matches, store_matches
from app.services.stats_service import format_trait_name
from app.config import get_settings

router = APIRouter(prefix="/matches", tags=["matches"])
settings = get_settings()


def _build_participant(p: dict) -> dict:
    return {
        "riot_id": f'{p.get("riotIdGameName", "Unknown")}#{p.get("riotIdTagline", "")}',
        "puuid": p["puuid"],
        "placement": p["placement"],
        "level": p["level"],
        "units": [
            {"id": u["chracter_id"], "tier": u["tier"], "items": u["itemNames"]}
            for u in p["units"]
        ],
        "traits": [
            {"name": format_trait_name(t["name"]), "num_units": t["nums_units"], "style": t["style"]}
            for t in p["traits"] if t["nums_units"] > 0
        ]
    }


@router.get("/{match_id}")
async def get_match_detail(match_id: str):
    cached = await asyncio.to_thread(get_cached_matches, [match_id])
    match = cached.get(match_id)

    if match is None:
        region = match_id.split("_")[0]
        riot_client = RiotClient(api_key=settings.riot_api_key, region=region)
        try:
            match = await riot_client.get_match(match_id)
            await asyncio.to_thread(store_matches, {match_id: match})
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Riot API error")
        finally:
            await riot_client.close()

        participants = sorted(match["info"]["participants"], key=lambda p: p["placement"])
        return {
            "match_id": match_id,
            "game_datetime": match["info"]["game_datetime"],
            "participants": [_build_participant(p) for p in participants],
        }
    
    