import { BASE_URL } from '@/lib/apiClient'
import type { DashboardData } from '@/types/tft'

export async function getMyDashboard(token: string): Promise<DashboardData> {
    const response = await fetch(`${BASE_URL}/me/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error(`Failed to fetch dashboard: ${response.status}`)
    return response.json() as Promise<DashboardData>
}

export async function getPlayerDashboard(
    region: string,
    gameName: string,
    tagLine: string
): Promise<DashboardData> {
    const response = await fetch(
        `${BASE_URL}/players/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/dashboard`
    )
    if (!response.ok) throw new Error(`Player not found: ${response.status}`)
    return response.json() as Promise<DashboardData>
}