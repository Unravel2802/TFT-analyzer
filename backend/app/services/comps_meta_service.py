from collections import defaultdict
from app.services.meta_common import dominant_set, participants_from_matches, short_name, is_real_unit, set_prefix
from app.services.stats_service import format_trait_name

_TRAIT_JUNK = ("Unique",)   # champion-specific hidden traits aren't comp identities

def _board_carries(units: list[dict], prefix: str | None, max_carries: int = 2) -> list[str]:
    candidates = []
    for u in units:
        uid = u["character_id"]
        if not is_real_unit(uid, prefix):
            continue
        n_items = len(u.get("itemNames", []))
        if n_items >= 2:
            candidates.append((n_items, short_name(uid)))
    candidates.sort(key=lambda c: (-c[0], c[1]))
    return [name for _, name in candidates[:max_carries]]

def _dominant_trait(traits: list[dict]) -> str | None:
    active = [
        t for t in traits 
        if t["num_units"] > 0 and not any(j in t["name"] for j in _TRAIT_JUNK)
    ]
    if not active:
        return None
    active.sort(key=lambda t: (t["style"], t["num_units"]), reverse=True)
    return format_trait_name(active[0]["name"])

def compute_comp_stats(participants:  list[dict], min_games: int = 1, set_number: int | None = None) -> list[dict]:
    total_boards = len(participants)
    if total_boards == 0:
        return []

    prefix = set_prefix(set_number)
    tally = defaultdict(lambda: {"games": 0, "placement_sum": 0, "top4": 0, "wins": 0})

    for p in participants:
        trait = _dominant_trait(p["traits"])
        if trait is None:
            continue
        carries = tuple(_board_carries(p["units"], prefix))
        key = (trait, carries)

        placement = p["placement"]
        row = tally[key]
        row["games"] += 1
        row["placement_sum"] += placement
        if placement <= 4:
            row["top4"] += 1
        if placement == 1:
            row["wins"] += 1
        
    results = []
    for (trait, carries), row in tally.items():
        games = row["games"]
        if games < min_games:
            continue
        name = trait if not carries else f"{trait} " + " & ".join(carries)
        results.append({
            "name": name,
            "trait": trait,
            "carries": list(carries),
            "games": games,
            "play_rate": round(games / total_boards * 100, 1),
            "avg_placement": round(row["placement_sum"] / games,  2),
            "top4_rate": round(row["top4"] / games * 100, 1),
            "win_rate": round(row["wins"] / games * 100, 1),
        })

    results.sort(key=lambda r: r["avg_placement"])
    return results


def compute_comps_meta(raw_matches: list[dict], min_games: int = 1) -> list[dict]:
    set_number = dominant_set(raw_matches)
    participants = participants_from_matches(raw_matches, set_number)
    return compute_comp_stats(participants, min_games=min_games, set_number=set_number)