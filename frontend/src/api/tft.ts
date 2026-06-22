import type { DashboardData, MatchDetail } from '../types/tft'
import { BASE_URL } from '@/lib/apiClient'

export async function getMyDashboard(token: string): Promise<DashboardData> {
    const response = await fetch(`${BASE_URL}/me/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}`}
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
        `${BASE_URL}/players/${region}/${gameName}/${tagLine}/dashboard`
    )
    if (!response.ok) throw new Error(`Player not found: ${response.status}`)
    return response.json() as Promise<DashboardData>
}

export async function getMatchDetail(matchId: string): Promise<MatchDetail> {
    const response = await fetch(`${BASE_URL}/matches/${matchId}`)
    if (!response.ok) throw new Error(`Failed to fetch match: ${response.status}`)
    return response.json() as Promise<MatchDetail>
}
