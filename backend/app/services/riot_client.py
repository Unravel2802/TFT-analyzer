import httpx

class RiotClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            headers={'X-Riot-Token': api_key},
            timeout=10.0
        )
    
    async def get_account(self, game_name: str, tag_line: str) -> dict:
        url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        response = await self.client.get(url)
        response.raise_for_status()
        return response.json()

    async def get_match_ids(self, puuid: str, count: int=20) -> list[str]:
        url = f"https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/{puuid}/ids?count={count}"
        response = await self.client.get(url)
        response.raise_for_status()
        return response.json()
    
    async def get_match(self, match_id: str) -> dict:
        url = f"https://americas.api.riotgames.com/tft/match/v1/matches/{match_id}"
        response = await self.client.get(url)
        response.raise_for_status()
        return response.json()

    async def close(self):
        return await self.client.close()
    