import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { getJournal, getTagReport, saveNote, deleteNote } from './api'
import TagPicker from './TagPicker'
import type { NoteEntry, TagReport } from '@/types/tft'
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

// Which recurring mistake costs you the most: avg placement per tag vs your
// baseline across all noted games. Only rendered once any note carries a tag.
function TagReportPanel({ report }: { report: TagReport }) {
    if (report.tags.length === 0) return null
    return (
        <section className='panel'>
            <h3 className='panel-title'>What your tags say</h3>
            <ul className='tag-report'>
                {report.tags.map(t => {
                    const diff = t.avg_placement - report.overall_avg_placement
                    const costly = diff >= 0.15
                    const helpful = diff <= -0.15
                    return (
                        <li key={t.tag} className='tag-report-row'>
                            <span className='tag-chip tag-chip-static'>{t.tag}</span>
                            <span className='tag-report-body'>
                                avg <strong>{t.avg_placement}</strong> vs your {report.overall_avg_placement} overall
                                <span className='tag-report-games'> ({t.games} {t.games === 1 ? 'game' : 'games'})</span>
                            </span>
                            {(costly || helpful) && (
                                <span className={`insight-delta insight-delta-${costly ? 'bad' : 'good'}`}>
                                    {diff <= 0 ? '−' : '+'}{Math.abs(diff).toFixed(1)}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

function NoteCard({ note, onSave, onDelete }: {
    note: NoteEntry
    onSave: (matchId: string, text: string, tags: string[]) => Promise<void>
    onDelete: (matchId: string) => void
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(note.note)
    const [draftTags, setDraftTags] = useState<string[]>(note.tags ?? [])
    const [saving, setSaving] = useState(false)

    const dirty = draft.trim() !== note.note || draftTags.join('|') !== (note.tags ?? []).join('|')

    async function save() {
        setSaving(true)
        try { await onSave(note.match_id, draft.trim(), draftTags); setEditing(false) }
        finally { setSaving(false) }
    }
    function cancel() {
        setDraft(note.note)
        setDraftTags(note.tags ?? [])
        setEditing(false)
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
                    <TagPicker selected={draftTags} onChange={setDraftTags} />
                    <div className='journal-edit-actions'>
                        <Button onClick={save} disabled={saving || !draft.trim() || !dirty}>
                            {saving ? 'Saving…' : 'Save'}
                        </Button>
                        <Button variant='ghost' onClick={cancel}>Cancel</Button>
                    </div>
                </>
            ) : (
                <>
                    <p className='journal-card-note'>{note.note}</p>
                    {(note.tags?.length ?? 0) > 0 && (
                        <div className='journal-card-tags'>
                            {note.tags.map(t => <span key={t} className='tag-chip tag-chip-static'>{t}</span>)}
                        </div>
                    )}
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
    const [report, setReport] = useState<TagReport | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState<SortDir>('new')

    const load = useCallback(async () => {
        try { setNotes(await getJournal(token!)); setError(null) }
        catch (e) { setError(e instanceof Error ? e.message : 'Failed to load') }
        finally { setLoading(false) }
        // The report is an extra; if it fails (rate limit) the journal still works.
        getTagReport(token!).then(setReport).catch(() => {})
    }, [token])
    useEffect(() => { load() }, [load])

    async function remove(matchId: string) {
        await deleteNote(token!, matchId)
        await load()
    }
    async function edit(matchId: string, text: string, tags: string[]) {
        await saveNote(token!, matchId, text, tags)
        await load()
    }

    // Filter by note text or tag, then order by updated_at in the chosen direction.
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        return notes
            .filter(n => n.note.toLowerCase().includes(q) || (n.tags ?? []).some(t => t.includes(q)))
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

            {report && <TagReportPanel report={report} />}

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
