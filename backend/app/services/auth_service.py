from jose import jwt
from datetime import datetime, timedelta, timezone
from supabase import create_client, Client
from app.config import get_settings
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt

settings = get_settings()
security = HTTPBearer()


supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {'sub': email, 'exp': expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)

def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload.get('sub')
    except Exception:
        return None

async def create_user(email: str, password: str, riot_id: str, region: str) -> dict:
    hashed = hash_password(password)
    result = supabase.table('users').insert({
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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    email = decode_access_token(token)

    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user