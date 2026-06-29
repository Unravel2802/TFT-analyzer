import asyncio
from app.repositories.accounts import get_cached_puuid, store_puuid


async def resolve_puuid(riot_client, game_name: str, tag_line: str) -> str:
    name_key, tag_key = game_name.lower(), tag_line.lower()
    puuid = await asyncio.to_thread(get_cached_puuid, name_key, tag_key)
    if puuid is None:
        account = await riot_client.get_account(game_name, tag_line)
        puuid = account["puuid"]
        await asyncio.to_thread(store_puuid, name_key, tag_key, puuid)
    return puuid