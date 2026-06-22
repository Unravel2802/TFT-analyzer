import { BASE_URL } from '@/lib/apiClient'
import type { MatchDetail } from '@/types/tft'

export async function getMatchDetail(matchId: string): Promise<MatchDetail> {
    const response = await fetch(`${BASE_URL}/matches/${matchId}`)
    if (!response.ok) throw new Error(`Failed to fetch match: ${response.status}`)
    return response.json() as Promise<MatchDetail>
}