import { BASE_URL } from '@/lib/apiClient'
import type { LeaderboardEntry } from '@/types/tft'

export async function getLeaderboard(region: string, limit = 25): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${BASE_URL}/leaderboard/${region}?limit=${limit}`)
    if (!response.ok) throw new Error(`Failed to fetch leaderboard: ${response.status}`)
    return response.json() as Promise<LeaderboardEntry[]>
}