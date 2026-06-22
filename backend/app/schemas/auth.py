from pydantic import BaseModel, field_validator


class SignupRequest(BaseModel):
    email: str
    password: str
    riot_id: str
    region: str

    @field_validator("riot_id")
    @classmethod
    def validate_riot_id(cls, v: str) -> str:
        if "#" not in v:
            raise ValueError("riot_id must be in the format Name#TAG (e.g. Unravel2802#NA1)")
        return v

    @field_validator("region")
    @classmethod
    def validate_region(cls, v: str) -> str:
        valid = ["NA1", "EUW1", "KR", "BR1"]
        if v.upper() not in valid:
            raise ValueError(f"region must be one of {valid}")
        return v.upper()


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"