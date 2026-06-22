from datetime import datetime, timezone, timedelta
from app.db.supabase import supabase

MAX_AGE = timedelta(days=30)

def get_cached_puuid(game_name: str, tag_line: str) -> str | None:
    result = (
        supabase.table("riot_accounts")
        .select("puuid, created_at")
        .eq("game_name", game_name)
        .eq("tag_line", tag_line)
        .execute()
    )
    if not result.data:
        return None
    row = result.data[0]
    age = datetime.now(timezone.utc) - datetime.fromisoformat(row["created_at"])
    if age > MAX_AGE:
        return None
    return row["puuid"]

def store_puuid(game_name: str, tag_line: str, puuid: str) -> None:
    supabase.table("riot_accounts").upsert({
        "game_name": game_name,
        "tag_line": tag_line,
        "puuid": puuid,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()