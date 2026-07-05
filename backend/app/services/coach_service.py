import re
from collections import defaultdict
from app.services.units_meta_service import compute_unit_stats
from app.services.stats_service import format_trait_name
from app.services.player_lookup import resolve_puuid, fetch_user_matches

# Board fillers, not real completed/component items.
_ITEM_JUNK = ("emptybag", "unusableslot")


async def _fetch_user_participants(riot_client, game_name, tag_line, count=20) -> list[dict]:
    puuid = await resolve_puuid(riot_client, game_name, tag_line)
    matches = await fetch_user_matches(riot_client, puuid, count=count)
    participants = []
    for m in matches:
        board = next((p for p in m["info"]["participants"] if p["puuid"] == puuid), None)
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


def format_item_name(item_id: str) -> str:
    """'TFT_Item_GuinsoosRageblade' -> 'Guinsoos Rageblade' (split on case changes)."""
    tail = item_id.split("_Item_")[-1]
    return re.sub(r"(?<=[a-z])(?=[A-Z])", " ", tail)


def compute_item_stats(participants: list[dict], min_games: int = 2) -> list[dict]:
    tally = defaultdict(lambda: {"games": 0, "placement_sum": 0})
    for p in participants:
        placement = p["placement"]
        seen = set()
        for unit in p["units"]:
            for item_id in unit.get("itemNames", []):
                # only real items carry an "_Item_" segment — set-mechanic ids
                # (e.g. TFT17_EkkoOffering_AnomalyItem) and junk are skipped
                if "_item_" not in item_id.lower():
                    continue
                if any(j in item_id.lower() for j in _ITEM_JUNK):
                    continue
                if item_id in seen:        # count once per board, like units/traits
                    continue
                seen.add(item_id)
                row = tally[item_id]
                row["games"] += 1
                row["placement_sum"] += placement

    results = []
    for item_id, row in tally.items():
        games = row["games"]
        if games < min_games:
            continue
        results.append({
            "name": format_item_name(item_id),
            "games": games,
            "avg_placement": round(row["placement_sum"] / games, 2),
        })
    results.sort(key=lambda r: r["avg_placement"])   # best (lowest) first
    return results


def stage_label(round_no: float) -> str:
    """Round number -> 'stage-pick' label. Stage 1 is rounds 1-4, then 7 rounds per stage."""
    r = round(round_no)
    if r <= 4:
        return f"1-{max(r, 1)}"
    return f"{2 + (r - 5) // 7}-{(r - 5) % 7 + 1}"


def compute_playstyle(participants: list[dict]) -> dict:
    """Averages that sketch how games end: board level, exit stage, damage, unspent gold."""
    n = len(participants)
    def avg(key): return sum(p.get(key, 0) for p in participants) / n
    return {
        "avg_level": round(avg("level"), 1),
        "avg_last_stage": stage_label(avg("last_round")),
        "avg_damage_dealt": round(avg("total_damage_to_players")),
        "avg_gold_left": round(avg("gold_left"), 1),
    }


async def build_coach(riot_client, game_name: str, tag_line: str, count: int = 20) -> dict:
    participants = await _fetch_user_participants(riot_client, game_name, tag_line, count=count)
    if not participants:
        return {
            "games_analyzed": 0, "overall_avg_placement": 0,
            "best_traits": [], "worst_traits": [], "best_units": [], "worst_units": [],
            "best_items": [], "worst_items": [], "playstyle": None,
        }

    units = compute_unit_stats(participants, min_games=2)      # already sorted best-first
    traits = compute_trait_stats(participants, min_games=2)
    items = compute_item_stats(participants, min_games=2)
    overall = round(sum(p["placement"] for p in participants) / len(participants), 2)

    return {
        "games_analyzed": len(participants),
        "overall_avg_placement": overall,
        "best_traits": traits[:3],
        "worst_traits": traits[-3:][::-1],   # highest avg = worst, shown worst-first
        "best_units": units[:3],
        "worst_units": units[-3:][::-1],
        "best_items": items[:3],
        "worst_items": items[-3:][::-1],
        "playstyle": compute_playstyle(participants),
    }