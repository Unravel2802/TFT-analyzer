from collections import Counter

_JUNK_MARKERS = ("PVE", "Enemy", "Summon", "Nitro")

def dominant_set(raw_matches: list[dict]) -> int | None:
    counts = Counter(m["info"].get("tft_set_number") for m in raw_matches)
    return counts.most_common(1)[0][0] if counts else None

def participants_from_matches(raw_matches: list[dict], set_number: int | None = None):
    out = []
    for m in raw_matches:
        info = m["info"]
        if set_number is not None and info.get("tft_set_number") != set_number:
            continue
        out.extend(info['participants'])
    return out

def set_prefix(set_number: int | None) -> str | None:
    return f"tft{set_number}_" if set_number is not None else None


def is_real_unit(character_id: str, prefix: str | None) -> bool:
    """True for a draftable, current-set unit (right set prefix, not PvE/summon junk)."""
    if prefix is not None and not character_id.lower().startswith(prefix):
        return False
    return not any(marker in character_id for marker in _JUNK_MARKERS)


def short_name(character_id: str) -> str:
    return character_id.split("_")[-1]