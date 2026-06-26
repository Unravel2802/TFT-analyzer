import { BASE_URL } from '@/lib/apiClient'
import type { UnitStat } from '@/types/tft'

export async function getUnitsMeta(minGames = 1): Promise<UnitStat[]> {
    const response = await fetch(`${BASE_URL}/meta/units?min_games=${minGames}`)
    if (!response.ok) throw new Error(`Failed to fetch units: ${response.status}`)
    return response.json() as Promise<UnitStat[]>
}

