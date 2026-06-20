export default function ProfileSkeleton() {
    return (
        <div className='profile' aria-busy='true' aria-label='Loading profile'>
            <header className='hero'>
                <div className='skeleton skeleton-emblem' />
                <div className='hero-identity'>
                    <div className='skeleton skeleton-line' style={{ width: 180, height: 28 }} />
                    <div className='skeleton skeleton-line' style={{ width: 120, height: 16 }} />
                </div>
                <div className='hero-stats'>
                    <div className='skeleton skeleton-card' />
                    <div className='skeleton skeleton-card' />
                    <div className='skeleton skeleton-card' />
                </div>
            </header>

            <div className='profile-grid'>
                <main className='profile-main'>
                    <div className='skeleton skeleton-panel' />
                    <div className='skeleton skeleton-panel' />
                    <div className='skeleton skeleton-panel' />
                </main>
                <aside className='profile-side'>
                    <div className='skeleton skeleton-panel' />
                    <div className='skeleton skeleton-panel' />
                </aside>
            </div>
        </div>
    )
}