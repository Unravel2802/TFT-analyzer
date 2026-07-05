from app.db.supabase import supabase


def store_snapshot(user_id, tier: str, division: str, lp: int, abs_lp_value: int) -> None:
    supabase.table("rank_snapshots").insert({
        "user_id": user_id,
        "tier": tier,
        "division": division,
        "lp": lp,
        "abs_lp": abs_lp_value,
    }).execute()


def get_snapshots(user_id) -> list[dict]:
    result = (
        supabase.table("rank_snapshots")
        .select("tier, division, lp, abs_lp, captured_at")
        .eq("user_id", user_id)
        .order("captured_at")
        .execute()
    )
    return result.data


def get_goal(user_id) -> dict | None:
    result = supabase.table("climb_goals").select("*").eq("user_id", user_id).execute()
    return result.data[0] if result.data else None


def upsert_goal(user_id, target_tier: str, target_division: str, target_abs_lp: int, updated_at: str) -> None:
    # updated_at is set explicitly: a column default only fires on INSERT, not on
    # the conflict-UPDATE path of an upsert, and the goal lock + journey clock
    # both read this field as "when the goal was set".
    supabase.table("climb_goals").upsert({
        "user_id": user_id,
        "target_tier": target_tier,
        "target_division": target_division,
        "target_abs_lp": target_abs_lp,
        "updated_at": updated_at,
    }).execute()


def delete_goal(user_id) -> None:
    supabase.table("climb_goals").delete().eq("user_id", user_id).execute()