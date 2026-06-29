import asyncio
from app.repositories.accounts import get_cached_puuid, store_puuid
from app.repositories.matches import get_cached_matches, store_matches

_sem = asyncio.Semaphore(5)


async def resolve_puuid(riot_client, game_name: str, tag_line: str) -> str:
    name_key, tag_key = game_name.lower(), tag_line.lower()
    puuid = await asyncio.to_thread(get_cached_puuid, name_key, tag_key)
    if puuid is None:
        account = await riot_client.get_account(game_name, tag_line)
        puuid = account["puuid"]
        await asyncio.to_thread(store_puuid, name_key, tag_key, puuid)
    return puuid


async def _fetch_one(riot_client, mid):
    async with _sem:
        return mid, await riot_client.get_match(mid)


async def fetch_user_matches(riot_client, puuid, count=20) -> list[dict]:
    """The user's recent raw match objects, newest-first."""
    match_ids = await riot_client.get_match_ids(puuid, count=count)
    cached = await asyncio.to_thread(get_cached_matches, match_ids)
    missing = [mid for mid in match_ids if mid not in cached]
    fetched = dict(await asyncio.gather(*[_fetch_one(riot_client, m) for m in missing]))
    await asyncio.to_thread(store_matches, fetched)
    all_matches = {**cached, **fetched}
    return [all_matches[mid] for mid in match_ids]