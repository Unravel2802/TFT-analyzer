import asyncio
from collections import defaultdict
from app.repositories.journal import list_notes
from app.repositories.matches import get_cached_matches
from app.services.player_lookup import resolve_puuid


def _placements_by_match(match_docs: dict[str, dict], puuid: str) -> dict[str, int]:
    """match_id -> the user's placement in that match (skipping docs they aren't in)."""
    out = {}
    for mid, doc in match_docs.items():
        board = next((p for p in doc["info"]["participants"] if p["puuid"] == puuid), None)
        if board is not None:
            out[mid] = board["placement"]
    return out


def compute_tag_report(notes: list[dict], placements: dict[str, int]) -> dict:
    """Same shape as compute_trait_stats: group by tag, average placement —
    'which recurring mistake costs you the most' from the journal's structure."""
    tally = defaultdict(lambda: {"games": 0, "placement_sum": 0})
    total_games = 0
    total_sum = 0
    for n in notes:
        placement = placements.get(n["match_id"])
        if placement is None:      # match doc missing or user not in it
            continue
        total_games += 1
        total_sum += placement
        for tag in n.get("tags") or []:
            tally[tag]["games"] += 1
            tally[tag]["placement_sum"] += placement

    tags = [
        {"tag": tag, "games": row["games"], "avg_placement": round(row["placement_sum"] / row["games"], 2)}
        for tag, row in tally.items()
    ]
    tags.sort(key=lambda r: r["avg_placement"], reverse=True)   # costliest first
    return {
        "games_analyzed": total_games,
        "overall_avg_placement": round(total_sum / total_games, 2) if total_games else 0,
        "tags": tags,
    }


async def build_tag_report(riot_client, user_id, game_name: str, tag_line: str) -> dict:
    notes = await asyncio.to_thread(list_notes, user_id)
    if not notes:
        return {"games_analyzed": 0, "overall_avg_placement": 0, "tags": []}
    # match_notes doesn't store placement, so pull it from the cached match docs
    # (every noted match was stored in tft_matches when the user viewed it).
    puuid = await resolve_puuid(riot_client, game_name, tag_line)
    docs = await asyncio.to_thread(get_cached_matches, [n["match_id"] for n in notes])
    return compute_tag_report(notes, _placements_by_match(docs, puuid))
