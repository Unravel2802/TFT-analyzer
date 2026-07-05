import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { getJournal, deleteNote } from './api'
import type { NoteEntry } from '@/types/tft'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

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

    if (loading) return <div className='page'><p className='status-text'>Loading your journal…</p></div>
    if (error) return <div className='page'><div className='error-box'><p className='error-text'>{error}</p></div></div>

    return (
        <div className='page page-doc'>
            <PageHeader
                title='Journal'
                subtitle='Notes you left on your matches — spot the patterns'
                stats={notes.length > 0 ? [{ label: notes.length === 1 ? 'note' : 'notes', value: notes.length }] : undefined}
            />

            {notes.length === 0
                ? (
                    <div className='insight-empty-panel'>
                        <p>No notes yet.</p>
                        <p className='insight-empty'>Open a match and jot down what happened — it'll show up here.</p>
                    </div>
                )
                : (
                    <ul className='journal-list'>
                        {notes.map(n => (
                            <li key={n.match_id} className='journal-card'>
                                <p className='journal-card-note'>{n.note}</p>
                                <div className='journal-card-foot'>
                                    <Link to={`/matches/${n.match_id}`} className='journal-match-link'>
                                        View match →
                                    </Link>
                                    <span className='journal-date'>{formatDate(n.updated_at)}</span>
                                    <Button variant='ghost' onClick={() => remove(n.match_id)}>Delete</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
        </div>
    )
}
