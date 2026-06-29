_TIER_ORDER = {
    "IRON": 0, "BRONZE": 1, "SILVER": 2, "GOLD": 3,
    "PLATINUM": 4, "EMERALD": 5, "DIAMOND": 6,
    "MASTER": 7, "GRANDMASTER": 7, "CHALLENGER": 7,
}
_DIVISION_INDEX = {"IV": 0, "III": 1, "II": 2, "I": 3, "": 0}


def abs_lp(tier: str, division: str, lp: int) -> int:
    tier_base = _TIER_ORDER.get(tier.upper(), 0) * 400
    div_base = _DIVISION_INDEX.get(division.upper(), 0) * 100
    return tier_base + div_base + lp