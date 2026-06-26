from app.services.units_meta_service import (
    compute_unit_stats,
    participants_from_matches,
    _format_unit_name,
)

def make_participant(placement, units=None):
    return {
        "placement": placement,
        "units": [{"character_id": cid} for cid in (units or[])],
    }

def test_format_unit_name_strips_set_prefix():
    assert _format_unit_name("TFT14_Ahri") == "Ahri"

class TestComputeUnitStats:
    def test_empty_returns_empty__list(self):
        assert compute_unit_stats([]) == []

    def test_play_rate_uses_total_boards_as_denominator(self):
        r = compute_unit_stats([
            make_participant(1, units=['TFT_Garen']),
            make_participant(2, units=["TFT_Lux"]),
        ])
        garen = next(u for u in r if u["name"] == "Garen")