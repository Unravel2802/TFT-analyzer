import { request } from '@/lib/apiClient'
import type { NoteEntry } from '@/types/tft'

export function getJournal(token: string): Promise<NoteEntry[]> {
    return request('/me/journal', { token, fallbackError: 'Failed to fetch journal' })
}

export async function saveNote(token: string, matchId: string, note: string): Promise<void> {
    await request(`/me/journal/${matchId}`, {
        method: 'PUT',
        token,
        body: { note },
        fallbackError: 'Failed to save note',
    })
}

export async function deleteNote(token: string, matchId: string): Promise<void> {
    await request(`/me/journal/${matchId}`, {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to delete note',
    })
}
