import httpx

_COMPANIONS_URL = (
    "https://raw.communitydragon.org/latest/plugins/"
    "rcp-be-lol-game-data/global/default/v1/companions.json"
)
_CDRAGON_BASE = (
    "https://raw.communitydragon.org/latest/plugins/"
    "rcp-be-lol-game-data/global/default/"
)

_companion_icons: dict[str, str] | None = None

def _asset_url(loadouts_icon: str) -> str:
    path = loadouts_icon.lower().replace("/lol-game-data/assets/", "")
    return _CDRAGON_BASE + path

async def _load_companions() -> dict[str, str]:
    global _companion_icons
    if _companion_icons is None:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(_COMPANIONS_URL)
            resp.raise_for_status()
            _companion_icons = {
                c["contentId"]: _asset_url(c["loadoutsIcon"])
                for c in resp.json()
                if c.get("contentId") and c.get("loadoutsIcon")
            }
    return _companion_icons

async def tactician_icon_url(content_id: str) -> str | None:
    icons = await _load_companions()
    return icons.get(content_id)

