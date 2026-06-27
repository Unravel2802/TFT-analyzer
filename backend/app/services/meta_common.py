from collections import Counter

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