import { BASE_URL } from '@/lib/apiClient'
import type { NoteEntry } from '@/types/tft'

export async function getJournal(token: string): Promise<NoteEntry[]> {
    const r = await fetch(`${BASE_URL}/me/journal`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!r.ok) throw new Error(`Failed to fetch journal: ${r.status}`)
    return r.json() as Promise<NoteEntry[]>
}

export async function saveNote(token: string, matchId: string, note: string): Promise<void> {
    const r = await fetch(`${BASE_URL}/me/journal/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note }),
    })
    if (!r.ok) throw new Error(`Failed to save note: ${r.status}`)
}

export async function deleteNote(token: string, matchId: string): Promise<void> {
    const r = await fetch(`${BASE_URL}/me/journal/${matchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!r.ok) throw new Error(`Failed to delete note: ${r.status}`)
}