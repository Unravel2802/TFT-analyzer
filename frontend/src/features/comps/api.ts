import { request } from '@/lib/apiClient'
import type { CompStat } from '@/types/tft'

export function getCompsMeta(minGames = 20): Promise<CompStat[]> {
    return request(`/meta/comps?min_games=${minGames}`, { fallbackError: 'Failed to fetch comps' })
}

export function getMyComps(token: string): Promise<CompStat[]> {
    return request('/me/comps', { token, fallbackError: 'Failed to fetch your comps' })
}
