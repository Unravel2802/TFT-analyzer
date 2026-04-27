from pydantic_settings import BaseSettings, SettingsConfigDict 
from functools import lru_cache


class Settings(BaseSettings):
    riot_api_key: str
    database_url: str
    allowed_origins: list[str]

    
    model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings() -> Settings:
    return Settings()
        
