export const BASE_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:8000'

// Called when a token-bearing request gets a 401 (expired/invalid session).
// AuthContext registers itself here so the layering stays one-directional:
// apiClient never imports React code.
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
    onUnauthorized = handler
}

export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    token?: string
    body?: unknown
    /** Shown when the server response has no usable `detail` message. */
    fallbackError?: string
}

// FastAPI errors are `{ detail: string }` or, for validation errors,
// `{ detail: [{ msg: string }, ...] }`. Prefer the server's message so
// friendly errors (e.g. the 429 "wait 2 minutes") reach the user.
async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
    try {
        const err = await res.json()
        if (Array.isArray(err.detail)) {
            return err.detail.map((e: { msg: string }) => e.msg).join(', ')
        }
        if (typeof err.detail === 'string') return err.detail
    } catch {
        // non-JSON body (proxy error page, empty response) — use the fallback
    }
    return fallback
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {}
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
    if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`

    const res = await fetch(`${BASE_URL}${path}`, {
        method: opts.method ?? 'GET',
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })

    if (!res.ok) {
        if (res.status === 401 && opts.token) onUnauthorized?.()
        const fallback = opts.fallbackError ?? `Request failed: ${res.status}`
        throw new ApiError(await extractErrorMessage(res, fallback), res.status)
    }

    return res.json() as Promise<T>
}
