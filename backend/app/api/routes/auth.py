from fastapi import APIRouter, HTTPException
from app.repositories.users import create_user, get_user_by_email
from app.core.security import verify_password, create_access_token
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse

router = APIRouter(prefix="/auth", tags=["auth"])