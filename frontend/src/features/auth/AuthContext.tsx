import { createContext, useContext, useEffect, useState } from 'react'
import { setUnauthorizedHandler } from '@/lib/apiClient'

const TOKEN_KEY = 'tiermind_token'

interface AuthContextType {
    token: string | null
    login: (token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Lazy initializer: read localStorage once, before the first render,
    // so a refresh never flashes the logged-out UI.
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

    function login(token: string) {
        localStorage.setItem(TOKEN_KEY, token)
        setToken(token)
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
    }

    // When any authenticated request gets a 401 (expired/invalid JWT),
    // drop the session; ProtectedRoute then redirects to /login on its own.
    useEffect(() => {
        setUnauthorizedHandler(logout)
        return () => setUnauthorizedHandler(null)
    }, [])

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
