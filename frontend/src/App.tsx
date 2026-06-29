import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import LoginPage from '@/features/auth/LoginPage'
import SignupPage from '@/features/auth/SignupPage'
import DashboardPage from '@/features/player/DashboardPage'
import SearchPage from '@/features/player/SearchPage'
import Navbar from './layout/Navbar'
import MatchDetailPage from '@/features/matches/MatchDetailPage'
import ProfilePage from '@/features/account/ProfilePage'
import SettingsPage from '@/features/account/SettingsPage'
import PlaceholderPage from '@/components/PlaceholderPage'
import UnitsPage from '@/features/units/UnitsPage'
import CompsPage from '@/features/comps/CompsPage'
import CoachPage from '@/features/coach/CoachPage'
import ClimbPage from '@/features/climb/ClimbPage'


function ProtectedRoute({ children }: { children: React.ReactNode}) {
    const { token } = useAuth()
    if (!token) return <Navigate to='/login' replace/>
    return <>{children}</>
 }

function RootRoute() {
    const { token } = useAuth()
    return token ? <Navigate to='/dashboard' /> : <SearchPage />
}

function AppContent() {
    return (
        <>
            <Navbar />
            <Routes>
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

                <Route 
                    path='/profile'
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/settings'
                    element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Public — all users */}
                <Route path='/leaderboard' element={<PlaceholderPage title='Leaderboard' />} />
                <Route path='/comps' element={<CompsPage />} />
                <Route path='/units' element={<UnitsPage />} />
                <Route path='/help' element={<PlaceholderPage title='Help / About' />} />

                {/* Signed-in only */}
                <Route path='/compare' element={<ProtectedRoute><PlaceholderPage title='Compare' /></ProtectedRoute>} />
                <Route path='/favorites' element={<ProtectedRoute><PlaceholderPage title='Favorites' /></ProtectedRoute>} />
                <Route path='/notifications' element={<ProtectedRoute><PlaceholderPage title='Notifications' /></ProtectedRoute>} />

                {/* Signed-in: differentiator features */}
                <Route path='/coach' element={<ProtectedRoute><CoachPage /></ProtectedRoute>} />                <Route path='/climb' element={<ProtectedRoute><PlaceholderPage title='Climb Tracker' note='Set a rank goal and track your LP over time — coming soon.' /></ProtectedRoute>} />
                <Route path='/journal' element={<ProtectedRoute><PlaceholderPage title='Game Journal' note='Annotate your matches and review your mistakes — coming soon.' /></ProtectedRoute>} />
                <Route path='/climb' element={<ProtectedRoute><ClimbPage /></ProtectedRoute>} />
                <Route path='/sessions' element={<ProtectedRoute><PlaceholderPage title='Sessions' note='Tilt and session awareness from your play patterns — coming soon.' /></ProtectedRoute>} />

                <Route path='/' element={<RootRoute />} />
                <Route path='*' element={<Navigate to='/dashboard' replace />} />
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