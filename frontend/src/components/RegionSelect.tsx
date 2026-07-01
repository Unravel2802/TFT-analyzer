import { useEffect, useRef, useState } from 'react'

interface Region { value: string; label: string }

interface Props {
    regions: Region[]
    value: string
    onChange: (value: string) => void
}

export default function RegionSelect({ regions, value, onChange }: Props) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const selected = regions.find(r => r.value === value)

    // close the menu when clicking anywhere outside it
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div className='region-dropdown' ref={ref}>
            <button
                type='button'
                className='region-trigger'
                onClick={() => setOpen(o => !o)}
                aria-haspopup='listbox'
                aria-expanded={open}
            >
                <span>{selected?.label ?? value}</span>
                <span className='region-caret'>▾</span>
            </button>

            {open && (
                <ul className='region-menu' role='listbox'>
                    {regions.map(r => (
                        <li
                            key={r.value}
                            role='option'
                            aria-selected={r.value === value}
                            className={r.value === value ? 'region-option region-option-active' : 'region-option'}
                            onClick={() => { onChange(r.value); setOpen(false) }}
                        >
                            {r.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}