import { request } from '@/lib/apiClient'
import type { CoachInsights } from '@/types/tft'

export function getMyCoach(token: string): Promise<CoachInsights> {
    return request('/me/coach', { token, fallbackError: 'Failed to fetch coach' })
}
