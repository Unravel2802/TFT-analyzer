from app.services.stats_service import StatsService, format_trait_name

def make_participant(placement, units=None, traits=None):
    return {
        "placement": placement,
        "units": [{"character_id": cid} for cid in (units or [])],
        "traits": [{"name": n, "num_units": k} for n, k in (traits or [])],
    }

def test_format_trait_name_maps_known():
    assert format_trait_name("TFT9_DarkStar") == "Dark Star"

def test_format_trait_name_falls_back_to_suffix():
    assert format_trait_name("TFT9_Brawler") == "Brawler"
    
def test_format_trait_name_splits_camelcase():
    assert format_trait_name("TFT17_SpaceGroove") == "Space Groove"

class TestComputeStats:
    def setup_method(self):
        self.service = StatsService(riot_client=None)
    
    def test_empty_returns_zeros(self):
        r = self.service.compute_stats([])
        assert r["avg_placement"] == 0
        assert r["top4_rate"] == "0.0%"
        assert r["win_rate"] == "0.0%"
        assert r["top_units"] == []
        assert r["top_traits"] == []

    def test_avg_placement(self):
        r = self.service.compute_stats([make_participant(p) for p in [1, 2, 3, 4]])
        assert r["avg_placement"] == 2.5

    def test_top4_and_win_rate(self):
        r = self.service.compute_stats([make_participant(p) for p in [1, 4, 5, 8]])
        assert r["top4_rate"] == "50.0%"
        assert r["win_rate"] == "25.0%"

    def test_top_units_counts_suffixes(self):
        r = self.service.compute_stats([
            make_participant(1, units=["TFT_Garen", "TFT_Lux"]),
            make_participant(2, units=["TFT_Garen"]),
        ])
        assert r["top_units"][0] ==("Garen", 2)

    def test_traits_exclude_zero_num_units(self):
        r = self.service.compute_stats([
            make_participant(1, traits=[("Set_DarkStar", 2), ("Set_Brawler", 0)]),
        ])
        names = [name for name, _ in r["top_traits"]]
        assert "Dark Star" in names
        assert "Brawler" not in names 