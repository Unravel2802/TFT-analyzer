from datetime import datetime, timezone, timedelta
from app.services.climb_service import _goal_lock_info


def test_goal_locked_when_set_recently():
    goal = {"updated_at": datetime.now(timezone.utc).isoformat()}
    can_change, _ = _goal_lock_info(goal)
    assert can_change is False


def test_goal_unlocked_after_a_week():
    goal = {"updated_at": (datetime.now(timezone.utc) - timedelta(days=8)).isoformat()}
    can_change, _ = _goal_lock_info(goal)
    assert can_change is True