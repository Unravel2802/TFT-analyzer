import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

export default function Navbar() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    function handleLogout() {
        setMenuOpen(false)
        logout()
        navigate('/')
    }

    const linkClass = ({ isActive }: { isActive: boolean }) => 
        isActive ? 'nav-link nav-link-active' : 'nav-link'

    return (
        <nav className='navbar'>
            <NavLink to='/' className='nav-brand'>TierMind</NavLink>
            <div className='nav-links'>
                {token ? (
                        <>
                        <NavLink to='/dashboard' className={linkClass}>Dashboard</NavLink>
                        <div className='nav-menu'>
                            <button
                                className='burger-button'
                                onClick={() => setMenuOpen(open => !open)}
                                aria-label='Menu'
                                aria-expanded={menuOpen}
                            >
                                <span className='burger-line' />
                                <span className='burger-line' />
                                <span className='burger-line' />
                            </button>

                            {menuOpen && (
                                <div className='dropdown'>
                                    <NavLink to='/profile' className='dropdown-item' onClick={() => setMenuOpen(false)}>Profile</NavLink>
                                    <NavLink to='/settings' className='dropdown-item' onClick={() => setMenuOpen(false)}>Settings </NavLink>
                                    <button className='dropdown-item dropdown-button' onClick={handleLogout}>Sign Out</button>
                                </div>
                            )}
                        </div>
                        </>
                ) : (
                    <>
                    <   NavLink to='/' className={linkClass} end>Search</NavLink>
                        <NavLink to='/login' className={linkClass}>Sign In</NavLink>
                        <NavLink to='/signup' className={linkClass}>Sign Up</NavLink>
                    </>
                )}
            </div>
        </nav>
    )
}