from app.services.comps_meta_service import (
    compute_comp_stats, _board_carries, _dominant_trait,
)


def make_participant(placement, units=None, traits=None):
    return {
        "placement": placement,
        "units": [{"character_id": cid, "itemNames": items} for cid, items in (units or [])],
        "traits": [{"name": n, "num_units": k, "style": s} for n, k, s in (traits or [])],
    }


class TestBoardCarries:
    def test_only_units_with_2plus_items_are_carries(self):
        units = [
            {"character_id": "TFT17_Jhin", "itemNames": ["a", "b", "c"]},
            {"character_id": "TFT17_Bard", "itemNames": ["a"]},        # 1 item -> not a carry
            {"character_id": "TFT17_Shen", "itemNames": []},
        ]
        assert _board_carries(units, "tft17_") == ["Jhin"]

    def test_carries_sorted_by_item_count(self):
        units = [
            {"character_id": "TFT17_Bard", "itemNames": ["a", "b"]},
            {"character_id": "TFT17_Jhin", "itemNames": ["a", "b", "c"]},
        ]
        assert _board_carries(units, "tft17_") == ["Jhin", "Bard"]   # 3 items before 2

    def test_capped_at_two_carries(self):
        units = [
            {"character_id": "TFT17_Jhin", "itemNames": ["a", "b", "c"]},
            {"character_id": "TFT17_Bard", "itemNames": ["a", "b", "c"]},
            {"character_id": "TFT17_Shen", "itemNames": ["a", "b", "c"]},
        ]
        assert len(_board_carries(units, "tft17_")) == 2

    def test_junk_and_wrong_set_units_cannot_be_carries(self):
        units = [
            {"character_id": "TFT17_PVE_ElderDragon", "itemNames": ["a", "b"]},
            {"character_id": "TFT15_Garen", "itemNames": ["a", "b"]},
        ]
        assert _board_carries(units, "tft17_") == []


class TestDominantTrait:
    def test_highest_style_wins(self):
        traits = [
            {"name": "TFT17_Sorcerer", "num_units": 4, "style": 3},
            {"name": "TFT17_Vanguard", "num_units": 6, "style": 1},
        ]
        assert _dominant_trait(traits) == "Sorcerer"

    def test_inactive_traits_ignored(self):
        traits = [{"name": "TFT17_Sorcerer", "num_units": 0, "style": 0}]
        assert _dominant_trait(traits) is None

    def test_unique_traits_are_not_comp_identities(self):
        traits = [
            {"name": "TFT17_BlitzcrankUniqueTrait", "num_units": 1, "style": 4},
            {"name": "TFT17_Sorcerer", "num_units": 4, "style": 3},
        ]
        assert _dominant_trait(traits) == "Sorcerer"


class TestComputeCompStats:
    def test_groups_same_trait_and_carries(self):
        p1 = make_participant(1, units=[("TFT17_Jhin", ["a", "b"])], traits=[("TFT17_Sorcerer", 4, 3)])
        p2 = make_participant(3, units=[("TFT17_Jhin", ["a", "b", "c"])], traits=[("TFT17_Sorcerer", 4, 3)])
        r = compute_comp_stats([p1, p2], min_games=1, set_number=17)
        assert len(r) == 1
        assert r[0]["name"] == "Sorcerer Jhin"
        assert r[0]["games"] == 2
        assert r[0]["avg_placement"] == 2.0

    def test_win_and_top4_rates(self):
        boards = [
            make_participant(1, units=[("TFT17_Jhin", ["a", "b"])], traits=[("TFT17_Sorcerer", 4, 3)]),
            make_participant(4, units=[("TFT17_Jhin", ["a", "b"])], traits=[("TFT17_Sorcerer", 4, 3)]),
            make_participant(8, units=[("TFT17_Jhin", ["a", "b"])], traits=[("TFT17_Sorcerer", 4, 3)]),
            make_participant(5, units=[("TFT17_Jhin", ["a", "b"])], traits=[("TFT17_Sorcerer", 4, 3)]),
        ]
        comp = compute_comp_stats(boards, min_games=1, set_number=17)[0]
        assert comp["win_rate"] == 25.0    # one 1st place of four
        assert comp["top4_rate"] == 50.0   # placements 1 and 4 are top4

    def test_board_without_active_trait_is_skipped(self):
        p = make_participant(1, units=[("TFT17_Jhin", ["a", "b"])], traits=[])
        assert compute_comp_stats([p], min_games=1, set_number=17) == []

    def test_min_games_filters_rare_comps(self):
        common = [
            make_participant(1, units=[("TFT17_Jhin", ["a", "b"])], traits=[("TFT17_Sorcerer", 4, 3)])
            for _ in range(3)
        ]
        rare = [make_participant(1, units=[("TFT17_Bard", ["a", "b"])], traits=[("TFT17_Vanguard", 4, 3)])]
        names = [c["name"] for c in compute_comp_stats(common + rare, min_games=2, set_number=17)]
        assert "Sorcerer Jhin" in names
        assert "Vanguard Bard" not in names

        
    def test_core_and_flex_split_by_frequency(self):
        boards = [
            make_participant(1, units=[("TFT17_Jhin", ["a", "b"]), ("TFT17_Lux", [])], traits=[("TFT17_Sorcerer", 4, 3)]),
            make_participant(2, units=[("TFT17_Jhin", ["a", "b"])], traits=[("TFT17_Sorcerer", 4, 3)]),
            make_participant(3, units=[("TFT17_Jhin", ["a", "b"])], traits=[("TFT17_Sorcerer", 4, 3)]),
        ]
        comp = compute_comp_stats(boards, min_games=1, set_number=17)[0]
        assert [u["id"] for u in comp["core_units"]] == ["TFT17_Jhin"]
        assert "TFT17_Lux" in [u["id"] for u in comp["flex_units"]]

    def test_carry_items_are_top_three(self):
        boards = [
            make_participant(1, units=[("TFT17_Jhin", ["IE", "LW", "GS"])], traits=[("TFT17_Sorcerer", 4, 3)]),
            make_participant(2, units=[("TFT17_Jhin", ["IE", "LW", "GS"])], traits=[("TFT17_Sorcerer", 4, 3)]),
        ]
        jhin = compute_comp_stats(boards, min_games=1, set_number=17)[0]["core_units"][0]
        assert jhin["id"] == "TFT17_Jhin"
        assert set(jhin["items"]) == {"IE", "LW", "GS"}

    def test_non_carry_unit_has_no_items(self):
        boards = [
            make_participant(1, units=[("TFT17_Jhin", ["IE", "LW"]), ("TFT17_Leona", [])], traits=[("TFT17_Sorcerer", 4, 3)]),
            make_participant(2, units=[("TFT17_Jhin", ["IE", "LW"]), ("TFT17_Leona", [])], traits=[("TFT17_Sorcerer", 4, 3)]),
        ]
        comp = compute_comp_stats(boards, min_games=1, set_number=17)[0]
        leona = next(u for u in comp["core_units"] if u["id"] == "TFT17_Leona")
        assert leona["items"] == []
