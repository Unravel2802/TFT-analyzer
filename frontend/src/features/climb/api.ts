import { request } from '@/lib/apiClient'
import type { ClimbData } from '@/types/tft'

export function getMyClimb(token: string): Promise<ClimbData> {
    return request('/me/climb', { token, fallbackError: 'Failed to fetch climb' })
}

export async function setClimbGoal(
    token: string,
    target_tier: string,
    target_division: string
): Promise<void> {
    await request('/me/climb/goal', {
        method: 'POST',
        token,
        body: { target_tier, target_division },
        fallbackError: 'Failed to set goal',
    })
}
