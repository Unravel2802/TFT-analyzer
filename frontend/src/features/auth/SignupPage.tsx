import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { signup } from '@/features/auth/api'

const DEFAULT_TAGS: Record<string, string> = {
    NA1: 'NA1', EUW1: 'EUW', KR: 'KR', BR1: 'BR1',
}

export default function SignupPage() {    
    const { login: setToken } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [riotId, setRiotId] = useState('')
    const [region, setRegion] = useState('NA1')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const fullRiotId = riotId.includes('#')
                ? riotId
                : `${riotId}#${DEFAULT_TAGS[region] ?? region}`
            const data = await signup(email, password, fullRiotId, region)
            setToken(data.access_token)
            navigate('/dashboard')
        } catch (err) {
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

                <input
                    className='search-input'
                    type='text'
                    placeholder='Riot ID (e.g. Unravel2802#NA1)'
                    value={riotId}
                    onChange={e => setRiotId(e.target.value)}
                />

                <select
                    className='search-input'
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                >
                    <option value='NA1'>NA</option>
                    <option value='EUW1'>EUW</option>
                    <option value='KR'>KR</option>
                    <option value='BR1'>BR</option>
                </select>

                {error && <p className='error-text'>{error}</p>}

                <button className='search-button' type='submit' disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>

                <p className='auth-switch'>
                    Already have an account?{' '}
                    <Link className='auth-link' to='/login'>Log in</Link>
                </p>
            </form>
        </div>
    )
} 