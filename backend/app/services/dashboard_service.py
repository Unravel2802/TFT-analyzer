import asyncio
from app.repositories.matches import get_cached_matches, store_matches
from app.repositories.accounts import get_cached_puuid, store_puuid
from app.clients.ddragon import get_latest_version, profile_icon_url
from app.clients.cdragon import tactician_icon_url

_riot_semaphore = asyncio.Semaphore(5)

async def _fetch_one(riot_client, match_id: str) -> tuple[str, dict]:
    async with _riot_semaphore:
        return match_id, await riot_client.get_match(match_id)

async def build_dashboard(riot_client, stats_service, game_name: str, tag_line: str) -> dict:
    name_key, tag_key = game_name.lower(), tag_line.lower()

    puuid = await asyncio.to_thread(get_cached_puuid, name_key, tag_key)
    if puuid is None:
        account = await riot_client.get_account(game_name, tag_line)
        puuid = account["puuid"]
        await asyncio.to_thread(store_puuid, name_key, tag_key, puuid)

    rank_data, match_ids, summoner = await asyncio.gather(
        stats_service.get_player_rank(puuid),
        riot_client.get_match_ids(puuid, count=20),
        riot_client.get_summoner_by_puuid(puuid),
    )

    cached = await asyncio.to_thread(get_cached_matches, match_ids)
    missing_ids = [mid for mid in match_ids if mid not in cached]
    fetched = dict(await asyncio.gather(*[_fetch_one(riot_client, mid) for mid in missing_ids]))
    await asyncio.to_thread(store_matches, fetched)

    all_matches = {**cached, **fetched}
    raw_matches = [all_matches[mid] for mid in match_ids]

    participants = [
        next(p for p in m["info"]["participants"] if p["puuid"] == puuid)
        for m in raw_matches
    ]

    stats = stats_service.compute_stats(participants)
    matches = [
        {
            "match_id": match_ids[i],
            "placement": p["placement"],
            "game_datetime": raw_matches[i]["info"]["game_datetime"],
            "units": [
                {"id": u["character_id"], "tier": u["tier"], "items": u["itemNames"]}
                for u in p["units"]
            ],
            "traits": [
                {"id": t["name"], "num_units": t["num_units"], "style": t["style"]}
                for t in p["traits"] if t["num_units"] > 0
            ],
        }
        for i, p in enumerate(participants)
    ]

    version = await get_latest_version()
    icon_url = profile_icon_url(version, summoner["profileIconId"])

    companion_id = participants[0].get("companion", {}).get("content_ID") if participants else None
    tactician_url = await tactician_icon_url(companion_id) if companion_id else None

    return {
        **stats, 
        **rank_data, 
        "riot_id": f"{game_name}#{tag_line}", 
        "profile_icon_url": icon_url,
        "tactician_icon_url": tactician_url,
        "matches": matches
    }