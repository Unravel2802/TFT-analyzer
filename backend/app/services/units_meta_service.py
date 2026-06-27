from collections import defaultdict
from app.services.meta_common import (
    dominant_set, participants_from_matches, set_prefix, is_real_unit, short_name,
)

def compute_unit_stats(participants: list[dict], min_games: int = 1, set_number: int | None = None) -> list[dict]:
    total_boards = len(participants)
    if total_boards == 0:
        return []
    
    prefix = set_prefix(set_number)
    tally = defaultdict(lambda: {"games": 0, "placement_sum": 0, "top4": 0})

    for p in participants:
        placement = p["placement"]
        seen = set()
        for unit in p["units"]:
            uid = unit["character_id"]
            if not is_real_unit(uid, prefix):     # also drop PvE/Enemy/Summon within the current set
                continue
            if uid in seen:
                continue
            seen.add(uid)
            row = tally[uid]
            row["games"] += 1
            row["placement_sum"] += placement
            if placement <= 4:
                row["top4"] += 1

    results = []
    for uid, row in tally.items():
        games = row["games"]
        if games < min_games:
            continue
        results.append({
            "unit_id": uid,
            "name": short_name(uid),
            "games": games,
            "play_rate": round(games / total_boards * 100, 1),
            "avg_placement": round(row["placement_sum"] / games, 2),
            "top4_rate": round(row["top4"] / games * 100, 1), 
        })
    results.sort(key=lambda r: r["avg_placement"])
    return results

def compute_units_meta(raw_matches: list[dict], min_games: int = 1) -> list[dict]:
    set_number = dominant_set(raw_matches)
    participants = participants_from_matches(raw_matches, set_number)
    return compute_unit_stats(participants, min_games=min_games, set_number=set_number)
    