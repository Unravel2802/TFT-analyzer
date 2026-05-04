from app.services.riot_client import RiotClient
from collections import Counter

class StatsService:
    def __init__(self, riot_client: RiotClient):
        self.riot_client = riot_client

    async def get_player_stats(self, puuid: str, count: int = 20) -> dict:
        match_ids = await self.riot_client.get_match_ids(puuid, count)

        placements = []
        unit_counts = Counter()
        trait_counts = Counter()

        for match_id in match_ids:
            match = await self.riot_client.get_match(match_id)

            participant = next(
                p for p in match["info"]["participants"]
                if p["puuid"] == puuid
            )

            placements.append(participant["placement"])

            for unit in participant["units"]:
                unit_counts[unit["character_id"]] += 1
            
            for trait in participant["traits"]:
                if trait["num_units"] > 0:
                    trait_counts[trait["name"]] += 1
        
        avg_placements = sum(placements) / len(placements)
        top4_counts = 0
        win_counts = 0 
        for placement in placements:
            if placement <= 4:
                if placement == 1:
                    win_counts += 1
                top4_counts += 1
        
        top4_rates = top4_counts / len(placements)
        win_rates = win_counts / len(placements)

        top_units = unit_counts.most_common(5)
        top_traits = trait_counts.most_common(5)

        return {                                         
            "avg_placement": avg_placements,
            "top4_rate": top4_rates,
            "win_rate": win_rates,
            "top_units": top_units,
            "top_traits": top_traits,
        }
