from collections import defaultdict

def _format_unit_name(character_id: str) -> str:
    return character_id.split("_")[-1]

def compute_unit_stats(participants: list[dict], min_games: int = 1) -> list[dict]:
    total_boards = len(participants)
    if total_boards == 0:
        return []
    
    tally = defaultdict(lambda: {"games": 0, "placement_sum": 0, "top4": 0})

    for p in participants:
        placement = p["placement"]
        seen = set()
        for unit in p["units"]:
            uid = unit["character_id"]
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
            "name": _format_unit_name(uid),
            "game": games,
            "play_rate": round(games / total_boards * 100, 1),
            "avg_placement": round(row["placement_sum"] / games, 2),
            "top4_rate": round(row["top4"] / games * 100, 1), 
        })
    results.sort(key=lambda r: r["avg_placement"])
    return results

def participants_from_matches(raw_matches: list[dict]) -> list[dict]:
    return [p for m in raw_matches for p in m["info"]["participants"]]