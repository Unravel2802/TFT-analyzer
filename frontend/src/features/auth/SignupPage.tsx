import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { signup } from '@/features/auth/api'
import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'
import { REGION_OPTIONS, defaultTagFor } from '@/lib/regions'

export default function SignupPage() {    
    const { login: setToken } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [riotId, setRiotId] = useState('')
    const [region, setRegion] = useState('na')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const fullRiotId = riotId.includes('#')
                ? riotId
                : `${riotId}#${defaultTagFor(region)}`
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

                <Dropdown fullWidth options={REGION_OPTIONS} value={region} onChange={setRegion} />

                {error && <p className='error-text'>{error}</p>}

                <Button type='submit' disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                </Button>

                <p className='auth-switch'>
                    Already have an account?{' '}
                    <Link className='auth-link' to='/login'>Log in</Link>
                </p>
            </form>
        </div>
    )
} 