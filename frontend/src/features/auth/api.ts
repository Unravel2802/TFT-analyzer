import { request } from '@/lib/apiClient'

export function signup(
    email: string,
    password: string,
    riotId: string,
    region: string
): Promise<{ access_token: string }> {
    return request('/auth/signup', {
        method: 'POST',
        body: { email, password, riot_id: riotId, region },
        fallbackError: 'Signup failed',
    })
}

export function login(email: string, password: string): Promise<{ access_token: string }> {
    return request('/auth/login', {
        method: 'POST',
        body: { email, password },
        fallbackError: 'Login failed',
    })
}
