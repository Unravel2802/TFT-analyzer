from fastapi import APIRouter, HTTPException
from app.repositories.users import create_user, get_user_by_email
from app.core.security import verify_password, create_access_token
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=AuthResponse)
async def signup(body: SignupRequest):
    existing = await get_user_by_email(body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    await create_user(body.email, body.password, body.riot_id, body.region)
    token = create_access_token(body.email)
    return AuthResponse(access_token=token)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    user = await get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(body.email)
    return AuthResponse(access_token=token)