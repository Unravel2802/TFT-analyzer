import asyncio
from app.repositories.climb import store_snapshot, get_snapshots, get_goal
from app.services.lp_utils import abs_lp
from app.services.player_lookup import resolve_puuid
from app.repositories.climb import store_snapshot, get_snapshots, get_goal, upsert_goal


async def build_climb(riot_client, stats_service, user_id, game_name: str, tag_line: str) -> dict:
    puuid = await resolve_puuid(riot_client, game_name, tag_line)
    rank = await stats_service.get_player_rank(puuid)          # {tier, rank, lp}
    tier, division, lp = rank["tier"], rank["rank"], rank["lp"]
    current_abs = abs_lp(tier, division, lp) if tier != "UNRANKED" else 0

    snapshots = await asyncio.to_thread(get_snapshots, user_id)
    last_abs = snapshots[-1]["abs_lp"] if snapshots else None

    # only record a new point when rank actually changed (avoid flat duplicates on refresh)
    if tier != "UNRANKED" and current_abs != last_abs:
        await asyncio.to_thread(store_snapshot, user_id, tier, division, lp, current_abs)
        snapshots = await asyncio.to_thread(get_snapshots, user_id)

    goal = await asyncio.to_thread(get_goal, user_id)

    progress = None
    if goal and snapshots:
        start_abs = snapshots[0]["abs_lp"]
        goal_abs = goal["target_abs_lp"]
        denom = goal_abs - start_abs
        pct = 0.0 if denom <= 0 else round(min(max((current_abs - start_abs) / denom, 0), 1) * 100, 1)
        progress = {
            "start_abs_lp": start_abs,
            "current_abs_lp": current_abs,
            "goal_abs_lp": goal_abs,
            "percent": pct,
        }

    return {
        "current": {"tier": tier, "division": division, "lp": lp, "abs_lp": current_abs},
        "goal": goal,
        "progress": progress,
        "snapshots": [{"abs_lp": s["abs_lp"], "captured_at": s["captured_at"]} for s in snapshots],
    }

async def set_goal(user_id, target_tier: str, target_division: str = "") -> None:
    target_abs = abs_lp(target_tier, target_division, 0)
    await asyncio.to_thread(
        upsert_goal, user_id, target_tier.upper(), target_division.upper(), target_abs
    )