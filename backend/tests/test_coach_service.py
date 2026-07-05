from app.services.coach_service import (
    compute_trait_stats, compute_item_stats, compute_playstyle,
    format_item_name, stage_label,
)


def make_participant(placement, traits=None, units=None):
    return {
        "placement": placement,
        "traits": [{"name": n, "num_units": k} for n, k in (traits or [])],
        "units": [{"itemNames": items} for items in (units or [])],
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


def test_item_stats_dedup_per_board_and_junk_filtered():
    r = compute_item_stats([
        # two Gargoyles on one board count once; anomaly/junk ids dropped
        make_participant(2, units=[
            ["TFT_Item_GargoyleStoneplate", "TFT17_EkkoOffering_AnomalyItem"],
            ["TFT_Item_GargoyleStoneplate", "TFT_Item_EmptyBag"],
        ]),
        make_participant(4, units=[["TFT_Item_GargoyleStoneplate"]]),
    ], min_games=2)
    assert len(r) == 1
    assert r[0]["name"] == "Gargoyle Stoneplate"
    assert r[0]["games"] == 2
    assert r[0]["avg_placement"] == 3.0


def test_item_stats_min_games():
    r = compute_item_stats([
        make_participant(1, units=[["TFT_Item_InfinityEdge"]]),
    ], min_games=2)
    assert r == []


def test_format_item_name():
    assert format_item_name("TFT_Item_GuinsoosRageblade") == "Guinsoos Rageblade"
    assert format_item_name("TFT5_Item_HandOfJusticeRadiant") == "Hand Of Justice Radiant"


def test_stage_label():
    assert stage_label(3) == "1-3"        # stage 1: rounds 1-4
    assert stage_label(5) == "2-1"        # stage 2 starts at round 5
    assert stage_label(28) == "5-3"       # 7 rounds per stage after that


def test_playstyle_averages():
    parts = [
        {"placement": 1, "level": 9, "last_round": 33, "total_damage_to_players": 120, "gold_left": 3, "traits": [], "units": []},
        {"placement": 8, "level": 7, "last_round": 23, "total_damage_to_players": 40, "gold_left": 15, "traits": [], "units": []},
    ]
    p = compute_playstyle(parts)
    assert p["avg_level"] == 8.0
    assert p["avg_last_stage"] == "5-3"   # mean round 28
    assert p["avg_damage_dealt"] == 80
    assert p["avg_gold_left"] == 9.0