from collections import defaultdict
from datetime import datetime, timezone, timedelta
from app.services.player_lookup import resolve_puuid, fetch_user_matches


def _is_loss(placement: int) -> bool:
    return placement >= 5   # bot-4 = "loss" in TFT framing


def _part_of_day(hour: int) -> str:
    if 5 <= hour <= 11: return "Morning"
    if 12 <= hour <= 16: return "Afternoon"
    if 17 <= hour <= 21: return "Evening"
    return "Night"


def compute_sessions(games: list[dict], tz_offset_minutes: int = 0) -> dict:
    """games: [{placement, game_datetime}] newest-first."""
    if not games:
        return {"games_analyzed": 0, "overall_avg_placement": 0,
                "current_streak": None, "after_two_losses": None, "time_of_day": []}

    placements = [g["placement"] for g in games]
    overall = round(sum(placements) / len(placements), 2)

    # current streak: consecutive same-type from the most recent game
    streak_is_loss = _is_loss(placements[0])
    count = 0
    for p in placements:
        if _is_loss(p) == streak_is_loss:
            count += 1
        else:
            break
    current_streak = {"type": "loss" if streak_is_loss else "win", "count": count}

    # placement in games that followed two consecutive losses (chronological)
    chrono = sorted(games, key=lambda g: g["game_datetime"])
    after = [
        chrono[i]["placement"]
        for i in range(2, len(chrono))
        if _is_loss(chrono[i - 1]["placement"]) and _is_loss(chrono[i - 2]["placement"])
    ]
    after_two_losses = (
        {"avg_placement": round(sum(after) / len(after), 2), "games": len(after)}
        if after else None
    )

    # time-of-day buckets in the user's local time
    tz = timezone(timedelta(minutes=tz_offset_minutes))
    buckets = defaultdict(lambda: {"sum": 0, "games": 0})
    for g in games:
        hour = datetime.fromtimestamp(g["game_datetime"] / 1000, tz=tz).hour
        b = _part_of_day(hour)
        buckets[b]["sum"] += g["placement"]
        buckets[b]["games"] += 1
    time_of_day = [
        {"part": b, "avg_placement": round(buckets[b]["sum"] / buckets[b]["games"], 2), "games": buckets[b]["games"]}
        for b in ["Morning", "Afternoon", "Evening", "Night"] if b in buckets
    ]

    return {
        "games_analyzed": len(games),
        "overall_avg_placement": overall,
        "current_streak": current_streak,
        "after_two_losses": after_two_losses,
        "time_of_day": time_of_day,
    }


async def build_sessions(riot_client, game_name, tag_line, tz_offset_minutes=0, count=20) -> dict:
    puuid = await resolve_puuid(riot_client, game_name, tag_line)
    matches = await fetch_user_matches(riot_client, puuid, count=count)
    games = []
    for m in matches:
        info = m["info"]
        p = next((x for x in info["participants"] if x["puuid"] == puuid), None)
        if p is not None:
            games.append({"placement": p["placement"], "game_datetime": info["game_datetime"]})
    return compute_sessions(games, tz_offset_minutes)