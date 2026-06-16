import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { signup } from '../api/tft'

export default function SignupPage({ onSwitch, onBack }: { onSwitch: () => void, onBack: () => void }) {    
    const { login: setToken } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const data = await signup(email, password)
            setToken(data.access_token)
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='page'>
            <h1 className='page-title'>TierMind</h1>
            <p className='page-tagline'>Know your game. Climb your rank.</p>

            <form className='auth-form' onSubmit={handleSubmit}>
                <h2 className='auth-title'>Create Account</h2>

                <input
                    className='search-input'
                    type='email'
                    placeholder='Email'
                    value = {email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    className='search-input'
                    type='password'
                    placeholder='Password'
                    value = {password}
                    onChange={e => setPassword(e.target.value)}
                />

                {error && <p className='error-text'>{error}</p>}

                <button className='search-button' type='submit' disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>

                <p className='auth-switch'>
                    Already have an account?{' '}
                    <span className='auth-link' onClick={onSwitch}>Sign in</span>
                </p>

                <p className='auth-switch'>
                    <span className='auth-link' onClick={onBack}>← Back to search</span>
                </p>
            </form>
        </div>
    )
} 