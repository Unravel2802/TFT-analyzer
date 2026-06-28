import { BASE_URL } from '@/lib/apiClient'
import type { CoachInsights } from '@/types/tft'

export async function getMyCoach(token: string): Promise<CoachInsights> {
    const response = await fetch(`${BASE_URL}/me/coach`, {
        headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`Failed to fetch coach: ${response.status}`)
    return response.json() as Promise<CoachInsights>
}