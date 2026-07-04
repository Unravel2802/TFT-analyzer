import { request } from '@/lib/apiClient'
import type { SessionsInsights } from '@/types/tft'

export function getMySessions(token: string, tzOffset: number): Promise<SessionsInsights> {
    return request(`/me/sessions?tz_offset=${tzOffset}`, {
        token,
        fallbackError: 'Failed to fetch sessions',
    })
}
