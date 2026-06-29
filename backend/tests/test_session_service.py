import datetime as dt
from app.services.session_service import compute_sessions


def g(placement, t):
    return {"placement": placement, "game_datetime": t}


def test_empty_returns_zeros():
    r = compute_sessions([])
    assert r["games_analyzed"] == 0
    assert r["current_streak"] is None
    assert r["time_of_day"] == []


def test_current_streak_counts_recent_losses():
    # newest-first: 7, 5 (losses), then 2 (win) breaks it
    r = compute_sessions([g(7, 300), g(5, 200), g(2, 100)])
    assert r["current_streak"] == {"type": "loss", "count": 2}


def test_current_streak_counts_recent_wins():
    r = compute_sessions([g(1, 300), g(4, 200), g(6, 100)])
    assert r["current_streak"] == {"type": "win", "count": 2}


def test_after_two_losses_avg():
    # newest-first input; chronologically: 7, 8 (two losses) then 2
    r = compute_sessions([g(2, 300), g(8, 200), g(7, 100)])
    assert r["after_two_losses"] == {"avg_placement": 2.0, "games": 1}


def test_time_of_day_bucket_uses_offset():
    # 08:00 UTC -> Morning at offset 0
    ms = int(dt.datetime(2021, 1, 1, 8, 0, tzinfo=dt.timezone.utc).timestamp() * 1000)
    r = compute_sessions([g(1, ms)], tz_offset_minutes=0)
    assert r["time_of_day"] == [{"part": "Morning", "avg_placement": 1.0, "games": 1}]