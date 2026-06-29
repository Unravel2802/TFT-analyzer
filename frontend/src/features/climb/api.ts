import { BASE_URL } from '@/lib/apiClient'
import type { ClimbData } from '@/types/tft'

export async function getMyClimb(token: string): Promise<ClimbData> {
    const r = await fetch(`${BASE_URL}/me/climb`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!r.ok) throw new Error(`Failed to fetch climb: ${r.status}`)
    return r.json() as Promise<ClimbData>
}

export async function setClimbGoal(token: string, target_tier: string, target_division: string): Promise<void> {
    const r = await fetch(`${BASE_URL}/me/climb/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_tier, target_division }),
    })
    if (!r.ok) throw new Error(`Failed to set goal: ${r.status}`)
}