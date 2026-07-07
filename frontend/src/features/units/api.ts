import { request } from '@/lib/apiClient'
import type { UnitStat } from '@/types/tft'

export function getUnitsMeta(minGames = 1): Promise<UnitStat[]> {
    return request(`/meta/units?min_games=${minGames}`, { fallbackError: 'Failed to fetch units' })
}

export function getMyUnits(token: string): Promise<UnitStat[]> {
    return request('/me/units', { token, fallbackError: 'Failed to fetch your units' })
}
