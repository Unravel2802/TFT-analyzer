from app.db.supabase import supabase

def get_cached_matches(match_ids: list[str]) -> dict[str, dict]:
    if not match_ids:
        return {}
    result = (
        supabase.table("tft_matches")
        .select("match_id, data")
        .in_("match_id", match_ids)
        .execute()
    )
    return {row["match_id"]: row["data"] for row in result.data}

def store_matches(matches: dict[str, dict]) -> None:
    if not matches:
        return 
    rows = [{"match_id": mid, "data": data} for mid, data in matches.items()]
    supabase.table("tft_matches").upsert(rows).execute() 

def get_all_matches(limit: int = 1000) -> list[dict]:
    result = (
        supabase.table("tft_matches")
        .select("data")
        .limit(limit)
        .execute()
    )
    
    return [row["data"] for row in result.data]