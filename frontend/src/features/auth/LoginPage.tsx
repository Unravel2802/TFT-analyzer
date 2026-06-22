import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { login } from '@/features/auth/api'

export default function LoginPage() {    
    const { login: setToken } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const data = await login(email, password)
            setToken(data.access_token)
            navigate('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message: 'Login failed')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className='page'>
            <p className='page-tagline'>Know your game. Climb your rank.</p>

            <form className='auth-form' onSubmit={handleSubmit}>
                <h2 className='auth-title'>Sign In</h2>
                <input
                    className='search-input'
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input 
                    className='search-input'
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                {error && <p className='error-text'>{error}</p>}

                <button className='search-button' type='submit' disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <p className='auth-switch'>
                    Don't have an account?{' '}
                    <Link className='auth-link' to='/signup'>Sign up</Link>
                </p>
            </form>
        </div>
    )
}