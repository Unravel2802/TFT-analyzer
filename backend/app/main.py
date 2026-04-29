from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

app = FastAPI(title='TFT Analyzer')

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allows_origins=settings.allowed_origins,
    allows_methods=['*'],
    allows_headers=['*'],
)

@app.get('/health')
def health_check():
    return {'status': 'ok'}