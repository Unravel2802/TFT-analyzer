import type { DashboardData, MatchDetail } from '../types/tft'
const BASE_URL = 'http://localhost:8000'

export async function signup(email: string, password: string): Promise<{ access_token: string }> {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail ?? 'Signup failed')
    }
    return response.json()
}


export async function login(email: string, password: string):  Promise<{ access_token: string }> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail ?? 'Login failed')
    }

    return response.json()
}

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
