import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { getJournal, deleteNote } from './api'
import type { NoteEntry } from '@/types/tft'

export default function JournalPage() {
    const { token } = useAuth()
    const [notes, setNotes] = useState<NoteEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        try { setNotes(await getJournal(token!)); setError(null) }
        catch (e) { setError(e instanceof Error ? e.message : 'Failed to load') }
        finally { setLoading(false) }
    }, [token])
    useEffect(() => { load() }, [load])

    async function remove(matchId: string) {
        await deleteNote(token!, matchId)
        await load()
    }

    if (loading) return <div className='page'><p className='page-tagline'>Loading your journal…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>

    return (
        <div className='page'>
            <h1 className='page-title'>Game Journal</h1>
            <p className='page-tagline'>Your match notes</p>
            {notes.length === 0
                ? <p className='muted'>No notes yet. Open a match and add one.</p>
                : (
                    <ul className='journal-list'>
                        {notes.map(n => (
                            <li key={n.match_id} className='journal-item'>
                                <p className='journal-note'>{n.note}</p>
                                <div className='journal-meta'>
                                    <Link to={`/matches/${n.match_id}`} className='nav-link'>View match</Link>
                                    <button className='text-button' onClick={() => remove(n.match_id)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
        </div>
    )
}