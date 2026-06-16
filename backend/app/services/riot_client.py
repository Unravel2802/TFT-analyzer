import httpx

REGION_MAP = {
    "NA1":  ("https://na1.api.riotgames.com",  "https://americas.api.riotgames.com"),
    "BR1":  ("https://br1.api.riotgames.com",  "https://americas.api.riotgames.com"),
    "LA1":  ("https://la1.api.riotgames.com",  "https://americas.api.riotgames.com"),
    "LA2":  ("https://la2.api.riotgames.com",  "https://americas.api.riotgames.com"),
    "OC1":  ("https://oc1.api.riotgames.com",  "https://americas.api.riotgames.com"),
    "EUW1": ("https://euw1.api.riotgames.com", "https://europe.api.riotgames.com"),
    "EUN1": ("https://eun1.api.riotgames.com", "https://europe.api.riotgames.com"),
    "TR1":  ("https://tr1.api.riotgames.com",  "https://europe.api.riotgames.com"),
    "RU":   ("https://ru.api.riotgames.com",   "https://europe.api.riotgames.com"),
    "KR":   ("https://kr.api.riotgames.com",   "https://asia.api.riotgames.com"),
    "JP1":  ("https://jp1.api.riotgames.com",  "https://asia.api.riotgames.com"),
    "SG2":  ("https://sg2.api.riotgames.com",  "https://sea.api.riotgames.com"),
}

REGION_ALIASES = {
    "NA":   "NA1",
    "EUW":  "EUW1",
    "EUNE": "EUN1",
    "KR":   "KR",
    "BR":   "BR1",
    "LAN":  "LA1",
    "LAS":  "LA2",
    "OCE":  "OC1",
    "TR":   "TR1",
    "RU":   "RU",
    "JP":   "JP1",
    "SG":   "SG2",
}

class RiotClient:
    def __init__(self, api_key: str, region: str = "NA1"):
        self.api_key = api_key
        normalized = region.upper()
        self.region = REGION_ALIASES.get(normalized, normalized)

        if self.region not in REGION_MAP:
            raise ValueError(f"Unsupported region: {region}. Choose from {list(REGION_MAP.keys())}")

        self.platform_url, self.cluster_url = REGION_MAP[self.region]

        self.client = httpx.AsyncClient(
            headers={'X-Riot-Token': api_key},
            timeout=30.0
        )

    async def get_account(self, game_name: str, tag_line: str) -> dict:
        url = f"{self.cluster_url}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        response = await self.client.get(url)
        response.raise_for_status()
        return response.json()

    async def get_summoner_by_puuid(self, puuid: str) -> dict:
        url = f"{self.platform_url}/lol/summoner/v4/summoners/by-puuid/{puuid}"
        response = await self.client.get(url)
        response.raise_for_status()
        return response.json()

    async def get_match_ids(self, puuid: str, count: int = 20) -> list[str]:
        url = f"{self.cluster_url}/tft/match/v1/matches/by-puuid/{puuid}/ids?count={count}"
        response = await self.client.get(url)
        response.raise_for_status()
        return response.json()

    async def get_match(self, match_id: str) -> dict:
        url = f"{self.cluster_url}/tft/match/v1/matches/{match_id}"
        response = await self.client.get(url)
        response.raise_for_status()
        return response.json()

    async def get_rank(self, puuid: str) -> dict | None:
        url = f"{self.platform_url}/tft/league/v1/by-puuid/{puuid}"
        response = await self.client.get(url)
        if not response.is_success:
            return None
        entries = response.json()
        for entry in entries:
            if entry["queueType"] == "RANKED_TFT":
                return entry
        return None

    async def close(self):
        return await self.client.aclose()