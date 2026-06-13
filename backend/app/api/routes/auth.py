from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from app.services.auth_service import (
    create_user,
    get_user_by_email,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: str
    password: str
    riot_id: str
    region: str

    @field_validator('riot_id')
    @classmethod
    def validate_riot_id(cls, v: str) -> str:
        if '#' not in v:
            raise ValueError('riot_id must be in the format Name#TAG (e.g. Unravel2802#NA1)')
        return v
    
    @field_validator('region')
    @classmethod
    def validate_region(cls, v: str) -> str:
        valid = ['NA1', 'EUW1', 'KR', 'BR1']
        if v.upper() not in valid:
            raise ValueError(f'region must be one of {valid}')
        return v.upper()


class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

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

