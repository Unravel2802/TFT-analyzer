from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.auth_service import (
    create_user,
    get_user_by_email,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

class AuthRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/signup", response_model=AuthResponse)
async def signup(body: AuthRequest):
    existing = await get_user_by_email(body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    await create_user(body.email, body.password)
    token = create_access_token(body.email)
    return AuthResponse(access_token=token)

@router.post("/login", response_model=AuthResponse)
async def login(body: AuthRequest):
    user = await get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(body.email)
    return AuthResponse(access_token=token)

