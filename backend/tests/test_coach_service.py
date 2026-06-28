from app.services.coach_service import compute_trait_stats


def make_participant(placement, traits=None):
    return {
        "placement": placement,
        "traits": [{"name": n, "num_units": k} for n, k in (traits or [])],
    }


def test_avg_placement_per_trait():
    r = compute_trait_stats([
        make_participant(2, traits=[("TFT17_Sorcerer", 4)]),
        make_participant(4, traits=[("TFT17_Sorcerer", 4)]),
    ], min_games=1)
    soc = next(t for t in r if t["name"] == "Sorcerer")
    assert soc["games"] == 2
    assert soc["avg_placement"] == 3.0


def test_inactive_and_unique_traits_excluded():
    r = compute_trait_stats([
        make_participant(1, traits=[("TFT17_Sorcerer", 0), ("TFT17_BlitzcrankUniqueTrait", 1)]),
    ], min_games=1)
    assert r == []   # Sorcerer inactive (0 units), Blitzcrank trait is unique


def test_min_games_filters_rare_traits():
    r = compute_trait_stats([
        make_participant(1, traits=[("TFT17_Sorcerer", 4)]),
    ], min_games=2)
    assert r == []


def test_sorted_best_first():
    r = compute_trait_stats([
        make_participant(1, traits=[("TFT17_Vanguard", 2)]),
        make_participant(8, traits=[("TFT17_Sorcerer", 4)]),
    ], min_games=1)
    assert r[0]["name"] == "Vanguard"     # avg 1, best
    assert r[-1]["name"] == "Sorcerer"    # avg 8, worst