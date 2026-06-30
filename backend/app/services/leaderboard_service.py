import asyncio
from app.clients.riot import RiotClient

_TIERS = ["challenger", "grandmaster", "master"]
_NAME_SEM = asyncio.Semaphore(5)   # cap concurrent name lookups


async def _resolve_name(rc: RiotClient, puuid: str) -> tuple[str | None, str | None]:
    async with _NAME_SEM:
        try:
            acct = await rc.get_account_by_puuid(puuid)
            return acct.get("gameName"), acct.get("tagLine")
        except Exception:
            return None, None


async def build_leaderboard(rc: RiotClient, limit: int = 25) -> list[dict]:
    # 1) pull all three apex tiers concurrently
    leagues = await asyncio.gather(*[rc.get_apex_league(t) for t in _TIERS])

    # 2) flatten entries, tagging each with its tier
    rows = []
    for league in leagues:
        tier = league["tier"]                  # e.g. "CHALLENGER"
        for e in league["entries"]:
            rows.append({
                "puuid": e["puuid"],
                "tier": tier,
                "league_points": e["leaguePoints"],
                "wins": e["wins"],
                "losses": e["losses"],
            })

    # 3) rank by LP, keep only the top `limit`
    rows.sort(key=lambda r: r["league_points"], reverse=True)
    top = rows[:limit]

    # 4) resolve riot-id names for just those top rows
    names = await asyncio.gather(*[_resolve_name(rc, r["puuid"]) for r in top])

    # 5) stitch together with 1-based ladder rank
    result = []
    for i, (r, (game_name, tag_line)) in enumerate(zip(top, names), start=1):
        result.append({
            "rank": i,
            "game_name": game_name,
            "tag_line": tag_line,
            **r,
        })
    return result
