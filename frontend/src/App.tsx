import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import LoginPage from '@/features/auth/LoginPage'
import SignupPage from '@/features/auth/SignupPage'
import DashboardPage from '@/features/player/DashboardPage'
import SearchPage from '@/features/player/SearchPage'
import Navbar from './layout/Navbar'
import MatchDetailPage from '@/features/matches/MatchDetailPage'

function ProtectedRoute({ children }: { children: React.ReactNode}) {
    const { token } = useAuth()
    if (!token) return <Navigate to='/login' replace/>
    return <>{children}</>
 }

function AppContent() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path='/' element={<SearchPage />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/signup' element={<SignupPage />} />
                <Route path='/matches/:id' element={<MatchDetailPage />} />
                <Route 
                    path='/dashboard'
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
        </>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}