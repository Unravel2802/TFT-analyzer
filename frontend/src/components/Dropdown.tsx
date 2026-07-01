import { useEffect, useRef, useState } from 'react'

export interface Option { value: string; label: string }

interface Props {
    options: Option[]
    value: string
    onChange: (value: string) => void
    fullWidth?: boolean
}

export default function Dropdown({ options, value, onChange, fullWidth }: Props) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const selected = options.find(o => o.value === value)

    // close the menu when clicking anywhere outside it
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div className={fullWidth ? 'select-box select-box-full' : 'select-box'} ref={ref}>
            <button
                type='button'
                className='select-box-trigger'
                onClick={() => setOpen(o => !o)}
                aria-haspopup='listbox'
                aria-expanded={open}
            >
                <span>{selected?.label ?? value}</span>
                <span className='select-box-caret'>▾</span>
            </button>

            {open && (
                <ul className='select-box-menu' role='listbox'>
                    {options.map(o => (
                        <li
                            key={o.value}
                            role='option'
                            aria-selected={o.value === value}
                            className={o.value === value ? 'select-box-option select-box-option-active' : 'select-box-option'}
                            onClick={() => { onChange(o.value); setOpen(false) }}
                        >
                            {o.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}