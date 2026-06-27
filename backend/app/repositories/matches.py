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

def store_matches(matches: dict[str, dict], source: str = "search") -> None:
    if not matches:
        return
    rows = [{"match_id": mid, "data": data, "source": source} for mid, data in matches.items()]
    supabase.table("tft_matches").upsert(rows).execute()


def get_all_matches(limit: int = 1000, source: str | None = None) -> list[dict]:
    query = supabase.table("tft_matches").select("data")
    if source is not None:
        query = query.eq("source", source)
    result = query.limit(limit).execute()
    return [row["data"] for row in result.data]