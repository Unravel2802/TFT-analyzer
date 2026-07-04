import { request } from '@/lib/apiClient'
import type { MatchDetail } from '@/types/tft'

export function getMatchDetail(matchId: string): Promise<MatchDetail> {
    return request(`/matches/${matchId}`, { fallbackError: 'Failed to fetch match' })
}
