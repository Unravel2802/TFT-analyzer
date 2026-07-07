from app.services.journal_service import compute_tag_report, _placements_by_match


def note(match_id, tags):
    return {"match_id": match_id, "note": "x", "tags": tags}


def test_empty_notes():
    r = compute_tag_report([], {})
    assert r == {"games_analyzed": 0, "overall_avg_placement": 0, "tags": []}


def test_groups_by_tag_and_averages():
    notes = [
        note("m1", ["int"]),
        note("m2", ["int", "tilted"]),
        note("m3", ["clutch"]),
    ]
    placements = {"m1": 7, "m2": 5, "m3": 1}
    r = compute_tag_report(notes, placements)
    assert r["games_analyzed"] == 3
    assert r["overall_avg_placement"] == round((7 + 5 + 1) / 3, 2)
    by_tag = {t["tag"]: t for t in r["tags"]}
    assert by_tag["int"] == {"tag": "int", "games": 2, "avg_placement": 6.0}
    assert by_tag["tilted"]["avg_placement"] == 5.0
    assert by_tag["clutch"]["avg_placement"] == 1.0
    # costliest (highest avg placement) first
    assert r["tags"][0]["tag"] == "int"


def test_skips_notes_without_resolvable_placement():
    notes = [note("m1", ["int"]), note("missing", ["int"])]
    r = compute_tag_report(notes, {"m1": 4})
    assert r["games_analyzed"] == 1
    assert r["tags"][0]["games"] == 1


def test_untagged_notes_count_toward_overall_only():
    notes = [note("m1", []), note("m2", ["clutch"])]
    r = compute_tag_report(notes, {"m1": 8, "m2": 2})
    assert r["games_analyzed"] == 2
    assert r["overall_avg_placement"] == 5.0
    assert len(r["tags"]) == 1


def test_placements_by_match_finds_own_board():
    docs = {
        "m1": {"info": {"participants": [
            {"puuid": "me", "placement": 3},
            {"puuid": "other", "placement": 6},
        ]}},
        "m2": {"info": {"participants": [{"puuid": "other", "placement": 1}]}},
    }
    assert _placements_by_match(docs, "me") == {"m1": 3}
