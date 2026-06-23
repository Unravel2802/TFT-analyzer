import httpx

_version_cache: str | None = None

async def get_latest_version() -> str:
    """Latest game patch, e.g. '15.12.1. Fetched once, then cached in memory."""
    global _version_cache
    if _version_cache is None:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get("https://ddragon.leagueoflegends.com/api/versions.json")
            resp.raise_for_status()
            _version_cache = resp.json()[0]
    return _version_cache

def profile_icon_url(version: str, icon_id: int) -> str:
    return f"https://ddragon.leagueoflegends.com/cdn/{version}/img/profileicon/{icon_id}.png"

