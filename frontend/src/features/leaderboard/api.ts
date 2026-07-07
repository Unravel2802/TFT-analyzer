import { request } from '@/lib/apiClient'
import type { LeaderboardEntry, MyRank } from '@/types/tft'

export function getLeaderboard(region: string, limit = 25): Promise<LeaderboardEntry[]> {
    return request(`/leaderboard/${region}?limit=${limit}`, {
        fallbackError: 'Failed to fetch leaderboard',
    })
}

export function getMyRank(token: string): Promise<MyRank> {
    return request('/me/rank', { token, fallbackError: 'Failed to fetch your rank' })
}
