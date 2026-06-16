import './App.css'
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'

function AppContent() {
    const { token } = useAuth()
    const [page, setPage] = useState<'search' | 'login' | 'signup'>('search')

    if (token) return <DashboardPage />
    if (page === 'login') return (
        <LoginPage
            onSwitch={() => setPage('signup')}
            onBack={() => setPage('search')}
        />
    )
    if (page === 'signup') return (
        <SignupPage
            onSwitch={() => setPage('login')}
            onBack={() => setPage('search')}
        />
    )
    return <SearchPage onLogin={() => setPage('login')} onSignup={() => setPage('signup')} />
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}