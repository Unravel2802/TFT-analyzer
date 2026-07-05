import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { getJournal, saveNote, deleteNote } from './api'
import type { NoteEntry } from '@/types/tft'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import PageHeader from '@/components/PageHeader'

type SortDir = 'new' | 'old'
const SORT_OPTIONS = [
    { value: 'new', label: 'Newest first' },
    { value: 'old', label: 'Oldest first' },
]

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function NoteCard({ note, onSave, onDelete }: {
    note: NoteEntry
    onSave: (matchId: string, text: string) => Promise<void>
    onDelete: (matchId: string) => void
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(note.note)
    const [saving, setSaving] = useState(false)

    async function save() {
        setSaving(true)
        try { await onSave(note.match_id, draft.trim()); setEditing(false) }
        finally { setSaving(false) }
    }

    return (
        <li className='journal-card'>
            {editing ? (
                <>
                    <textarea
                        className='note-input'
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        rows={3}
                        autoFocus
                    />
                    <div className='journal-edit-actions'>
                        <Button onClick={save} disabled={saving || !draft.trim() || draft.trim() === note.note}>
                            {saving ? 'Saving…' : 'Save'}
                        </Button>
                        <Button variant='ghost' onClick={() => { setDraft(note.note); setEditing(false) }}>Cancel</Button>
                    </div>
                </>
            ) : (
                <>
                    <p className='journal-card-note'>{note.note}</p>
                    <div className='journal-card-foot'>
                        <Link to={`/matches/${note.match_id}`} className='journal-match-link'>View match →</Link>
                        <span className='journal-date'>{formatDate(note.updated_at)}</span>
                        <Button variant='ghost' onClick={() => setEditing(true)}>Edit</Button>
                        <Button variant='ghost' onClick={() => onDelete(note.match_id)}>Delete</Button>
                    </div>
                </>
            )}
        </li>
    )
}

export default function JournalPage() {
    const { token } = useAuth()
    const [notes, setNotes] = useState<NoteEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState<SortDir>('new')

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
    async function edit(matchId: string, text: string) {
        await saveNote(token!, matchId, text)
        await load()
    }

    // Filter by note text, then order by updated_at in the chosen direction.
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        return notes
            .filter(n => n.note.toLowerCase().includes(q))
            .sort((a, b) => {
                const diff = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                return sort === 'new' ? diff : -diff
            })
    }, [notes, query, sort])

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
                    <>
                        <div className='journal-toolbar'>
                            <input
                                className='journal-search'
                                type='search'
                                placeholder='Search notes…'
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                            <Dropdown options={SORT_OPTIONS} value={sort} onChange={v => setSort(v as SortDir)} />
                        </div>

                        {visible.length === 0
                            ? <p className='journal-empty-filter'>No notes match “{query}”.</p>
                            : (
                                <ul className='journal-list'>
                                    {visible.map(n => (
                                        <NoteCard key={n.match_id} note={n} onSave={edit} onDelete={remove} />
                                    ))}
                                </ul>
                            )}
                    </>
                )}
        </div>
    )
}
