from datetime import datetime, timezone, timedelta
from app.services.climb_service import _goal_lock_info, _journey_info


def test_goal_locked_when_set_recently():
    goal = {"updated_at": datetime.now(timezone.utc).isoformat()}
    can_change, _ = _goal_lock_info(goal)
    assert can_change is False


def test_goal_unlocked_after_a_week():
    goal = {"updated_at": (datetime.now(timezone.utc) - timedelta(days=8)).isoformat()}
    can_change, _ = _goal_lock_info(goal)
    assert can_change is True


NOW = datetime(2026, 7, 5, 12, 0, tzinfo=timezone.utc)


def _iso(days_ago: float) -> str:
    return (NOW - timedelta(days=days_ago)).isoformat()


def test_journey_measures_from_rank_at_goal_set_time():
    # snapshots straddle the goal-set moment: start must be the 1200 point
    # (last one at/before set time), not the older 1000 one.
    goal = {"updated_at": _iso(10), "target_abs_lp": 2000}
    snaps = [
        {"abs_lp": 1000, "captured_at": _iso(20)},
        {"abs_lp": 1200, "captured_at": _iso(12)},
        {"abs_lp": 1500, "captured_at": _iso(3)},
    ]
    j = _journey_info(goal, snaps, current_abs=1500, now=NOW)
    assert j["start_abs_lp"] == 1200
    assert j["days_elapsed"] == 10
    assert j["lp_gained"] == 300
    assert j["lp_per_day"] == 30.0
    assert j["eta_days"] == 17     # 500 LP left at 30/day, rounded up


def test_journey_goal_older_than_history_starts_at_first_snapshot():
    goal = {"updated_at": _iso(30), "target_abs_lp": 2000}
    snaps = [{"abs_lp": 1100, "captured_at": _iso(5)}]
    j = _journey_info(goal, snaps, current_abs=1300, now=NOW)
    assert j["start_abs_lp"] == 1100


def test_journey_too_young_for_pace():
    goal = {"updated_at": _iso(0.5), "target_abs_lp": 2000}
    j = _journey_info(goal, [], current_abs=1500, now=NOW)
    assert j["days_elapsed"] == 0
    assert j["lp_per_day"] is None
    assert j["eta_days"] is None


def test_journey_negative_pace_has_no_eta():
    goal = {"updated_at": _iso(10), "target_abs_lp": 2000}
    snaps = [{"abs_lp": 1500, "captured_at": _iso(11)}]
    j = _journey_info(goal, snaps, current_abs=1400, now=NOW)
    assert j["lp_gained"] == -100
    assert j["lp_per_day"] == -10.0
    assert j["eta_days"] is None


def test_journey_goal_reached_eta_zero():
    goal = {"updated_at": _iso(10), "target_abs_lp": 1400}
    snaps = [{"abs_lp": 1300, "captured_at": _iso(11)}]
    j = _journey_info(goal, snaps, current_abs=1450, now=NOW)
    assert j["eta_days"] == 0