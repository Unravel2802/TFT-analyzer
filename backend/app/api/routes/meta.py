from fastapi import APIRouter
from app.repositories.matches import get_all_matches
from app.services.units_meta_service import (
    compute_unit_stats,
    participants_from_matches,
)

from app.schemas.meta import UnitStat

router = APIRouter(prefix="/meta", tags=["meta"])

@router.get("/units", response_model=list[UnitStat])
def get_units_meta(min_games: int = 1):
    raw_matches = get_all_matches()
    participants = participants_from_matches(raw_matches)
    return compute_unit_stats(participants, min_games=min_games)

