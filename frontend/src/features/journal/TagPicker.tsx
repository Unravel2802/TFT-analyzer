import { NOTE_TAGS } from './tags'

// Toggleable chips from the fixed vocabulary. Selection state lives in the
// parent (the note draft) so saving a note persists text + tags in one PUT.
export default function TagPicker({ selected, onChange }: {
    selected: string[]
    onChange: (tags: string[]) => void
}) {
    function toggle(tag: string) {
        onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag])
    }
    return (
        <div className='tag-picker' role='group' aria-label='Match tags'>
            {NOTE_TAGS.map(tag => {
                const on = selected.includes(tag)
                return (
                    <button
                        key={tag}
                        type='button'
                        className={`tag-chip${on ? ' tag-chip-on' : ''}`}
                        aria-pressed={on}
                        onClick={() => toggle(tag)}
                    >
                        {tag}
                    </button>
                )
            })}
        </div>
    )
}
