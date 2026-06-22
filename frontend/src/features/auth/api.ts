import { BASE_URL } from '@/lib/apiClient'

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

export async function login(email: string, password: string): Promise<{ access_token: string }> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail ?? 'Login failed')
    }
    return response.json()
}