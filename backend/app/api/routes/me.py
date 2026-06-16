from fastapi import APIRouter, Depends, HTTPException
from app.services.auth_service import get_current_user
from app.services.riot_client import RiotClient
from app.services.stats_service import StatsService, format_trait_name
from app.config import get_settings
import asyncio
import httpx

router = APIRouter(prefix="/me", tags=["me"])
settings = get_settings()

@router.get("/dashboard")
async def get_my_dashboard(current_user: dict = Depends(get_current_user)):
    riot_id = current_user["riot_id"]
    region = current_user["region"]
    game_name, tag_line= riot_id.split("#")

    riot_client = RiotClient(api_key=settings.riot_api_key, region=region)
    stats_service = StatsService(riot_client)

    try: 
        account = await riot_client.get_account(game_name, tag_line)
        puuid = account["puuid"]

        rank_data, match_ids = await asyncio.gather(
            stats_service.get_player_rank(puuid),
            riot_client.get_match_ids(puuid, count=20)
        )

        raw_matches = list(await asyncio.gather(
            *[riot_client.get_match(match_id) for match_id in match_ids]
        ))
        
        participants = [
            next(p for p in m["info"]["participants"] if p["puuid"] == puuid) 
            for m in raw_matches
        ]

        stats = stats_service.compute_stats(participants)

        matches = [
            {
                "placement": p["placement"],
                "game_datetime": raw_matches[i]["info"]["game_datetime"],
                "units": [u["character_id"].split("_")[-1] for u in p["units"]],
                "traits": [
                    format_trait_name(t["name"])
                    for t in p["traits"]
                    if t["num_units"] > 0
                ],
            }
            for i, p in enumerate(participants)
        ]

        return {**stats, **rank_data, "riot_id": riot_id, "matches": matches}
    
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Riot API rate limit hit. Wait 2 minutes")
        raise
    finally:
        await riot_client.close()