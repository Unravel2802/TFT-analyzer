import re

from app.clients.riot import RiotClient
from collections import Counter

TRAIT_DISPLAY_NAMES = {
    "APTrait": "A.P.",
    "DRX": "DRX",
    "DarkStar": "Dark Star",
    "Fateweaver": "Fateweaver",
    "Timebreaker": "Timebreaker",
    "MeleeTrait": "Melee",
}

def format_trait_name(raw: str) -> str:
    key = raw.split("_")[-1]
    if key in TRAIT_DISPLAY_NAMES:
        return TRAIT_DISPLAY_NAMES[key]
    return re.sub(r"(?<=[a-z])(?=[A-Z])", " ", key)   # SpaceGroove -> Space Groove

class StatsService:
    def __init__(self, riot_client: RiotClient):
        self.riot_client = riot_client

    async def get_player_rank(self, puuid: str) -> dict:
        rank_entry = await self.riot_client.get_rank(puuid)

        if rank_entry is None:
            return {"tier": "UNRANKED", "rank": "", "lp": 0}
        
        return {
            "tier": rank_entry["tier"],
            "rank": rank_entry["rank"],
            "lp": rank_entry["leaguePoints"],
        }

    def compute_stats(self, participants: list[dict]) -> dict:
        if not participants:
            return {
                "avg_placement": 0,
                "top4_rate": "0.0%",
                "win_rate": "0.0%",
                "top_units": [],
                "top_traits": [],
            }
        placements = []
        unit_counts = Counter()
        trait_counts = Counter()
        
        for participant in participants:
            placements.append(participant["placement"])
            for unit in participant["units"]:
                unit_counts[unit["character_id"].split("_")[-1]] += 1
            for trait in participant["traits"]:
                if trait["num_units"] > 0:
                    trait_counts[format_trait_name(trait["name"])] += 1

        avg_placement = sum(placements) / len(placements)
        top4_count = sum(1 for p in placements if p <= 4)
        win_count = sum(1 for p in placements if p == 1)

        return {
            "avg_placement": avg_placement,
            "top4_rate": str(round(top4_count / len(placements) * 100, 1)) + "%",
            "win_rate": str(round(win_count / len(placements) * 100, 1)) + "%",
            "top_units": unit_counts.most_common(5),
            "top_traits": trait_counts.most_common(5)
        }