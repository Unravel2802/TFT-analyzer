import { BASE_URL } from '@/lib/apiClient'
import type { CompStat } from '@/types/tft'

export async function getCompsMeta(minGames = 20): Promise<CompStat[]> {
    const response = await fetch(`${BASE_URL}/meta/comps?min_games=${minGames}`)
    if (!response.ok) throw new Error(`Failed to fetch comps: ${response.status}`)
    return response.json() as Promise<CompStat[]>
}