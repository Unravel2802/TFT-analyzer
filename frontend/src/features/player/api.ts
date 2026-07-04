import { request } from '@/lib/apiClient'
import type { DashboardData } from '@/types/tft'

export function getMyDashboard(token: string): Promise<DashboardData> {
    return request('/me/dashboard', { token, fallbackError: 'Failed to fetch dashboard' })
}

export function getPlayerDashboard(
    region: string,
    gameName: string,
    tagLine: string
): Promise<DashboardData> {
    return request(
        `/players/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/dashboard`,
        { fallbackError: 'Player not found' }
    )
}
