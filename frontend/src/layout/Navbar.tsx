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

    const closeMenu = () => setMenuOpen(false)

    return (
        <nav className='navbar'>
            {/* Left: brand + auth links for guests */}
            <div className='nav-left'>
                <NavLink to='/' className='nav-brand'>TierMind</NavLink>
                {!token && (
                    <>
                        <NavLink to='/login' className={linkClass}>Sign In</NavLink>
                        <NavLink to='/signup' className={linkClass}>Sign Up</NavLink>
                    </>
                )}
            </div>

            {/* Right */}
            <div className='nav-links'>
                {token ? (
                    <>
                        {/* Top-level: signature personal features */}
                        <NavLink to='/dashboard' className={linkClass}>Dashboard</NavLink>
                        <NavLink to='/coach' className={linkClass}>Coach</NavLink>
                        <NavLink to='/climb' className={linkClass}>Climb</NavLink>
                        <NavLink to='/journal' className={linkClass}>Journal</NavLink>
                        <NavLink to='/sessions' className={linkClass}>Sessions</NavLink>

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
                                    <p className='dropdown-label'>Explore</p>
                                    <NavLink to='/leaderboard' className='dropdown-item' onClick={closeMenu}>Leaderboard</NavLink>
                                    <NavLink to='/comps' className='dropdown-item' onClick={closeMenu}>Comps</NavLink>
                                    <NavLink to='/units' className='dropdown-item' onClick={closeMenu}>Units</NavLink>
                                    <NavLink to='/compare' className='dropdown-item' onClick={closeMenu}>Compare</NavLink>

                                    <div className='dropdown-divider' />

                                    <p className='dropdown-label'>Account</p>
                                    <NavLink to='/favorites' className='dropdown-item' onClick={closeMenu}>Favorites</NavLink>
                                    <NavLink to='/notifications' className='dropdown-item' onClick={closeMenu}>Notifications</NavLink>
                                    <NavLink to='/profile' className='dropdown-item' onClick={closeMenu}>Profile</NavLink>
                                    <NavLink to='/settings' className='dropdown-item' onClick={closeMenu}>Settings</NavLink>
                                    <NavLink to='/help' className='dropdown-item' onClick={closeMenu}>Help</NavLink>

                                    <div className='dropdown-divider' />
                                    <button className='dropdown-item dropdown-button' onClick={handleLogout}>Sign Out</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Guests: no burger, so public pages are top-level */}
                        <NavLink to='/' className={linkClass} end>Search</NavLink>
                        <NavLink to='/leaderboard' className={linkClass}>Leaderboard</NavLink>
                        <NavLink to='/comps' className={linkClass}>Comps</NavLink>
                        <NavLink to='/units' className={linkClass}>Units</NavLink>
                        <NavLink to='/augments' className={linkClass}>Augments</NavLink>
                        <NavLink to='/help' className={linkClass}>Help</NavLink>
                    </>
                )}
            </div>
        </nav>
    )
}