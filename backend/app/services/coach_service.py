import asyncio
from collections import defaultdict

from app.repositories.accounts import get_cached_puuid, store_puuid
from app.repositories.matches import get_cached_matches, store_matches
from app.services.units_meta_service import compute_unit_stats
from app.services.stats_service import format_trait_name
from app.services.player_lookup import resolve_puuid

_sem = asyncio.Semaphore(5)


async def _fetch(riot_client, mid):
    async with _sem:
        return mid, await riot_client.get_match(mid)


async def _fetch_user_participants(riot_client, game_name, tag_line, count=20) -> list[dict]:
    name_key, tag_key = game_name.lower(), tag_line.lower()
    puuid = await asyncio.to_thread(get_cached_puuid, name_key, tag_key)
    match_ids = await riot_client.get_match_ids(puuid, count=count)
    if puuid is None:
        account = await riot_client.get_account(game_name, tag_line)
        puuid = account["puuid"]
        await asyncio.to_thread(store_puuid, name_key, tag_key, puuid)

    match_ids = await riot_client.get_match_ids(puuid, count=count)
    cached = await asyncio.to_thread(get_cached_matches, match_ids)
    missing = [mid for mid in match_ids if mid not in cached]
    fetched = dict(await asyncio.gather(*[_fetch(riot_client, mid) for mid in missing]))
    await asyncio.to_thread(store_matches, fetched)   # source defaults to 'search'

    all_matches = {**cached, **fetched}
    participants = []
    for mid in match_ids:
        board = next((p for p in all_matches[mid]["info"]["participants"] if p["puuid"] == puuid), None)
        if board is not None:
            participants.append(board)
    return participants


def compute_trait_stats(participants: list[dict], min_games: int = 2) -> list[dict]:
    tally = defaultdict(lambda: {"games": 0, "placement_sum": 0})
    for p in participants:
        placement = p["placement"]
        seen = set()
        for t in p["traits"]:
            if t["num_units"] <= 0 or "Unique" in t["name"]:   # active, non-unique only
                continue
            name = format_trait_name(t["name"])
            if name in seen:
                continue
            seen.add(name)
            tally[name]["games"] += 1
            tally[name]["placement_sum"] += placement

    results = []
    for name, row in tally.items():
        games = row["games"]
        if games < min_games:
            continue
        results.append({
            "name": name,
            "games": games,
            "avg_placement": round(row["placement_sum"] / games, 2),
        })
    results.sort(key=lambda r: r["avg_placement"])   # best (lowest) first
    return results


async def build_coach(riot_client, game_name: str, tag_line: str, count: int = 20) -> dict:
    participants = await _fetch_user_participants(riot_client, game_name, tag_line, count=count)
    if not participants:
        return {
            "games_analyzed": 0, "overall_avg_placement": 0,
            "best_traits": [], "worst_traits": [], "best_units": [], "worst_units": [],
        }

    units = compute_unit_stats(participants, min_games=2)      # already sorted best-first
    traits = compute_trait_stats(participants, min_games=2)
    overall = round(sum(p["placement"] for p in participants) / len(participants), 2)

    return {
        "games_analyzed": len(participants),
        "overall_avg_placement": overall,
        "best_traits": traits[:3],
        "worst_traits": traits[-3:][::-1],   # highest avg = worst, shown worst-first
        "best_units": units[:3],
        "worst_units": units[-3:][::-1],
    }