from app.db.supabase import supabase
from app.core.security import hash_password


async def create_user(email: str, password: str, riot_id: str, region: str) -> dict:
    hashed = hash_password(password)
    result = supabase.table("users").insert({
        "email": email,
        "hashed_password": hashed,
        "riot_id": riot_id,
        "region": region,
    }).execute()
    return result.data[0]


async def get_user_by_email(email: str) -> dict | None:
    result = supabase.table("users").select("*").eq("email", email).execute()
    if result.data:
        return result.data[0]
    return None