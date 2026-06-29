from datetime import datetime, timezone
from app.db.supabase import supabase


def list_notes(user_id) -> list[dict]:
    result = (
        supabase.table("match_notes")
        .select("match_id, note, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data


def upsert_note(user_id, match_id: str, note: str) -> None:
    supabase.table("match_notes").upsert(
        {
            "user_id": user_id,
            "match_id": match_id,
            "note": note,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        on_conflict="user_id,match_id",
    ).execute()


def delete_note(user_id, match_id: str) -> None:
    supabase.table("match_notes").delete().eq("user_id", user_id).eq("match_id", match_id).execute()