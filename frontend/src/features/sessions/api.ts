import { BASE_URL } from '@/lib/apiClient'
import type { SessionsInsights } from '@/types/tft'

export async function getMySessions(token: string, tzOffset: number): Promise<SessionsInsights> {
    const r = await fetch(`${BASE_URL}/me/sessions?tz_offset=${tzOffset}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!r.ok) throw new Error(`Failed to fetch sessions: ${r.status}`)
    return r.json() as Promise<SessionsInsights>
}