import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/')
    }

    const linkClass = ({ isActive }: { isActive: boolean }) => 
        isActive ? 'nav-link nav-link-active' : 'nav-link'

    return (
        <nav className='navbar'>
            <NavLink to='/' className='nav-brand'>TierMind</NavLink>
            <div className='nav-links'>
                <NavLink to='/' className={linkClass} end>Search</NavLink>
                {token ? (
                    <>
                        <NavLink to='/dashboard' className={linkClass}>Dashboard</NavLink>
                        <button className='nav-button' onClick={handleLogout}>Sign Out</button>
                    </>
                ) : (
                    <>
                        <NavLink to='/login' className={linkClass}>Sign In</NavLink>
                        <NavLink to='/signup' className={linkClass}>Sign Up</NavLink>
                    </>
                )}
            </div>
        </nav>
    )
}