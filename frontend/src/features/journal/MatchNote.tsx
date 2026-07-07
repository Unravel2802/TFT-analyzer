import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getJournal, saveNote, deleteNote } from './api'
import TagPicker from './TagPicker'
import Button from '@/components/Button'

export default function MatchNote({ matchId }: { matchId: string }) {
    const { token } = useAuth()
    const [note, setNote] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [saved, setSaved] = useState('')      // last persisted value
    const [savedTags, setSavedTags] = useState<string[]>([])
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (!token) return
        let active = true
        getJournal(token)
            .then(notes => {
                if (!active) return
                const existing = notes.find(n => n.match_id === matchId)
                if (existing) {
                    setNote(existing.note); setSaved(existing.note)
                    setTags(existing.tags ?? []); setSavedTags(existing.tags ?? [])
                }
            })
            .catch(() => {})
        return () => { active = false }
    }, [token, matchId])

    if (!token) return null   // notes are a signed-in feature

    const dirty = note !== saved || tags.join('|') !== savedTags.join('|')

    async function save() {
        setStatus('Saving…')
        try { await saveNote(token!, matchId, note, tags); setSaved(note); setSavedTags(tags); setStatus('Saved') }
        catch { setStatus('Failed to save') }
    }
    async function remove() {
        setStatus('Deleting…')
        try { await deleteNote(token!, matchId); setNote(''); setSaved(''); setTags([]); setSavedTags([]); setStatus('Deleted') }
        catch { setStatus('Failed to delete') }
    }

    return (
        <div className='match-note'>
            <h3 className='panel-title'>Your note</h3>
            <textarea
                className='note-input'
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder='What happened this game? (e.g. greedy econ, threw at 6)'
                rows={3}
            />
            <TagPicker selected={tags} onChange={setTags} />
            <div className='note-actions'>
                <Button onClick={save} disabled={!note.trim() || !dirty}>Save</Button>
                {saved && <Button variant='ghost' onClick={remove}>Delete</Button>}
                <span className='muted'>{status}</span>
            </div>
        </div>
    )
}
