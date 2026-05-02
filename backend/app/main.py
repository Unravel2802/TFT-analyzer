from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.routes import players

app = FastAPI(title='TFT Analyzer')

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(players.router)

@app.get('/health')
def health_check():
    return {'status': 'ok'}