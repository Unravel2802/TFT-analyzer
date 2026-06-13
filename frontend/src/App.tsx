import './App.css'
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import PlayerPage from "./pages/PlayerPage";
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function AppContent() {
  const { token } = useAuth()
  const [page, setPage] = useState<'login' | 'signup'>('login')

  if (token) {
    return <PlayerPage />
  }

  if (page === 'signup') {
    return <SignupPage onSwitch={() => setPage('login')} />
  }

  return <LoginPage onSwitch={() => setPage('signup')}/> 
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}