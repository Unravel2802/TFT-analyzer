#!/usr/bin/env python3
"""Seed tft_matches with high-elo ladder games, labeled source='ladder'.
Run from backend/:  python ../scripts/seed_matches.py
"""
import asyncio
import os
import sys

import httpx

# make `app` importable when run from backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.config import get_settings
from app.clients.riot import RiotClient
from app.repositories.matches import get_cached_matches, store_matches

REGION = "NA1"
TIERS = ["challenger", "grandmaster", "master"]
MAX_PLAYERS = 20          # keep small: dev keys are rate-limited (~100 req / 2 min)
MATCHES_PER_PLAYER = 10

_sem = asyncio.Semaphore(5)   # cap concurrent Riot calls


async def fetch_match(rc: RiotClient, mid: str):
    async with _sem:
        for _ in range(3):                       # retry on rate limit
            try:
                return mid, await rc.get_match(mid)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    await asyncio.sleep(10)
                    continue
                raise
        return mid, None


async def main():
    rc = RiotClient(api_key=get_settings().riot_api_key, region=REGION)
    try:
        # 1) collect apex player puuids
        puuids = []
        for tier in TIERS:
            league = await rc.get_apex_league(tier)
            puuids += [e["puuid"] for e in league["entries"]]
            if len(puuids) >= MAX_PLAYERS:
                break
        puuids = puuids[:MAX_PLAYERS]
        print(f"collected {len(puuids)} apex players")

        # 2) their recent match ids (deduped)
        match_ids = set()
        for puuid in puuids:
            match_ids.update(await rc.get_match_ids(puuid, count=MATCHES_PER_PLAYER))
        print(f"{len(match_ids)} unique matches")

        # 3) relabel already-cached apex matches as ladder (no refetch needed)
        cached = get_cached_matches(list(match_ids))
        if cached:
            store_matches(cached, source="ladder")
            print(f"relabeled {len(cached)} already-cached matches as ladder")

        # 4) fetch the rest, store as ladder
        missing = [m for m in match_ids if m not in cached]
        print(f"fetching {len(missing)} new matches...")
        fetched = dict(await asyncio.gather(*[fetch_match(rc, m) for m in missing]))
        fetched = {m: d for m, d in fetched.items() if d is not None}   # drop failed fetches
        store_matches(fetched, source="ladder")
        print(f"stored {len(fetched)} new ladder matches")
    finally:
        await rc.close()


asyncio.run(main())