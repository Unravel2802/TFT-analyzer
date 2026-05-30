import type { Account, PlayerStats } from '../types/tft'

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