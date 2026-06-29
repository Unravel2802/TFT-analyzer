from fastapi import APIRouter
from app.repositories.matches import get_all_matches
from app.services.units_meta_service import compute_units_meta
from app.services.comps_meta_service import compute_comps_meta
from app.services.cache import ttl_cached
from app.schemas.meta import UnitStat, CompStat

router = APIRouter(prefix="/meta", tags=["meta"])
_META_TTL = 300


@router.get("/units", response_model=list[UnitStat])
def get_units_meta(min_games: int = 1):
    return ttl_cached(
        ("units", min_games), _META_TTL,
        lambda: compute_units_meta(get_all_matches(source="ladder"), min_games=min_games),
    )


@router.get("/comps", response_model=list[CompStat])
def get_comps_meta(min_games: int = 20):
    return ttl_cached(
        ("comps", min_games), _META_TTL,
        lambda: compute_comps_meta(get_all_matches(source="ladder"), min_games=min_games),
    )