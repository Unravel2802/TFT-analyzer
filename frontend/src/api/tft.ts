import type { Account, PlayerStats, MatchEntry } from '../types/tft'

const BASE_URL = 'http://localhost:8000'

export async function getAccount (
    gameName: string,
    tagLine: string
): Promise<Account> {
    const response = await fetch(`${BASE_URL}/players/${gameName}/${tagLine}`)
    
    if (!response.ok) {
        throw new Error(`Failed to fetch account: ${response.status}`)
    }

    return response.json() as Promise<Account>
}

export async function getPlayerStats(
    region: string,
    gameName: string,
    tagLine: string
): Promise<PlayerStats> {
    const response = await fetch(`${BASE_URL}/players/${region}/${gameName}/${tagLine}/stats`)

    if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
    }

    return response.json() as Promise<PlayerStats>
}

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

export async function getMyStats(token: string): Promise<PlayerStats> {
    const response = await fetch(`${BASE_URL}/me/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
    }

    return response.json() as Promise<PlayerStats> 
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

export async function getMyMatches(token: string): Promise<MatchEntry[]> {
    const response = await fetch(`${BASE_URL}/me/matches`, {
        headers: { 'Authorization': `Bearer ${token}`}
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`)
    }

    return response.json()
}