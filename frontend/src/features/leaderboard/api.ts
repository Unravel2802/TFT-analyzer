import { request } from '@/lib/apiClient'
import type { LeaderboardEntry } from '@/types/tft'

export function getLeaderboard(region: string, limit = 25): Promise<LeaderboardEntry[]> {
    return request(`/leaderboard/${region}?limit=${limit}`, {
        fallbackError: 'Failed to fetch leaderboard',
    })
}
