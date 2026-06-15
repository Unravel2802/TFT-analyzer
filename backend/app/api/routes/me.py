from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user
from app.services.riot_client import RiotClient
from app.services.stats_service import StatsService, format_trait_name
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

@router.get("/matches")
async def get_my_matches(current_user: dict = Depends(get_current_user)):
    riot_id = current_user["riot_id"]
    region = current_user["region"]
    game_name, tag_line = riot_id.split("#")

    riot_client = RiotClient(api_key=settings.riot_api_key, region=region)

    try:
        account = await riot_client.get_account(game_name, tag_line)
        puuid = account["puuid"]

        match_ids = await riot_client.get_match_ids(puuid, count=20)

        matches = []
        for match_id in match_ids:
            match = await riot_client.get_match(match_id)
            info = match["info"]

            participant = next(
                p for p in info["participants"]
                if p["puuid"] == puuid
            )

            units = [
                unit["character_id"].split("_")[-1]
                for unit in participant["units"]
            ]

            traits = [
                format_trait_name(t["name"])
                for t in participant["traits"]
                if t["num_units"] > 0
            ]

            matches.append({
                "placement": participant["placement"],
                "game_datetime": info["game_datetime"],
                "units": units,
                "traits": traits,
            })
        return matches
    finally:
        await riot_client.close()