from app.services.units_meta_service import compute_unit_stats, _format_unit_name
from app.services.meta_common import participants_from_matches

def make_participant(placement, units=None):
    return {
        "placement": placement,
        "units": [{"character_id": cid} for cid in (units or [])],
    }


def test_format_unit_name_strips_set_prefix():
    assert _format_unit_name("TFT14_Ahri") == "Ahri"


class TestComputeUnitStats:
    def test_empty_returns_empty_list(self):
        assert compute_unit_stats([]) == []

    def test_play_rate_uses_total_boards_as_denominator(self):
        r = compute_unit_stats([
            make_participant(1, units=["TFT_Garen"]),
            make_participant(2, units=["TFT_Lux"]),
        ])
        garen = next(u for u in r if u["name"] == "Garen")
        assert garen["games"] == 1
        assert garen["play_rate"] == 50.0

    def test_avg_placement_uses_unit_games_as_denominator(self):
        r = compute_unit_stats([
            make_participant(2, units=["TFT_Garen"]),
            make_participant(4, units=["TFT_Garen"]),
        ])
        garen = next(u for u in r if u["name"] == "Garen")
        assert garen["avg_placement"] == 3.0

    def test_top4_rate(self):
        r = compute_unit_stats([
            make_participant(1, units=["TFT_Garen"]),
            make_participant(4, units=["TFT_Garen"]),
            make_participant(8, units=["TFT_Garen"]),
        ])
        garen = next(u for u in r if u["name"] == "Garen")
        assert garen["top4_rate"] == 66.7

    def test_duplicate_unit_on_one_board_counts_once(self):
        r = compute_unit_stats([
            make_participant(1, units=["TFT_Garen", "TFT_Garen"]),
        ])
        garen = next(u for u in r if u["name"] == "Garen")
        assert garen["games"] == 1

    def test_min_games_filters_rare_units(self):
        r = compute_unit_stats(
            [
                make_participant(1, units=["TFT_Garen", "TFT_Lux"]),
                make_participant(2, units=["TFT_Garen"]),
            ],
            min_games=2,
        )
        names = [u["name"] for u in r]
        assert "Garen" in names
        assert "Lux" not in names

    def test_sorted_by_avg_placement_ascending(self):
        r = compute_unit_stats([
            make_participant(1, units=["TFT_Lux"]),
            make_participant(8, units=["TFT_Garen"]),
        ])
        assert r[0]["name"] == "Lux"
        assert r[-1]["name"] == "Garen"

    def test_set_prefix_whitelists_current_set_only(self):
        # set_number=17 -> keep TFT17_*, drop TFT15_* and event units
        r = compute_unit_stats(
            [
                make_participant(1, units=["TFT17_Jhin", "TFT15_Garen", "TFTEvent5YR_Kayle"]),
            ],
            set_number=17,
        )
        names = [u["name"] for u in r]
        assert names == ["Jhin"]

    def test_junk_markers_drop_pve_and_enemy_in_current_set(self):
        # even with the right prefix, PvE/Enemy units are excluded
        r = compute_unit_stats(
            [
                make_participant(1, units=["TFT17_Jhin", "TFT17_Enemy_Aatrox", "TFT17_PVE_ElderDragon"]),
            ],
            set_number=17,
        )
        names = [u["name"] for u in r]
        assert names == ["Jhin"]


def test_participants_from_matches_filters_by_set_and_flattens():
    matches = [
        {"info": {"tft_set_number": 17, "participants": [{"x": 1}, {"x": 2}]}},
        {"info": {"tft_set_number": 15, "participants": [{"x": 3}]}},   # wrong set, dropped
    ]
    assert participants_from_matches(matches, 17) == [{"x": 1}, {"x": 2}]