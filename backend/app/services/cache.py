import time

_store: dict = {}


def ttl_cached(key, ttl_seconds: int, producer):
    """Return cached value for key if fresh, else compute via producer() and store it."""
    now = time.time()
    hit = _store.get(key)
    if hit and hit[0] > now:
        return hit[1]
    value = producer()
    _store[key] = (now + ttl_seconds, value)
    return value


async def async_ttl_cached(key, ttl_seconds: int, producer):
    """Like ttl_cached, but producer() returns a coroutine we await."""
    now = time.time()
    hit = _store.get(key)
    if hit and hit[0] > now:
        return hit[1]
    value = await producer()
    _store[key] = (now + ttl_seconds, value)
    return value