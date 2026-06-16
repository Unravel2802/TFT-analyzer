import { useState } from 'react'

interface SearchBarProps {
    onSearch: (region: string, gameName: string, tagLine: string) => void
    loading?: boolean
}

const DEFAULT_TAGS: Record<string, string> = {
    'na':   'NA1',
    'euw':  'EUW',
    'eune': 'EUNE',
    'kr':   'KR1',
    'br':   'BR1',
    'lan':  'LAN',
    'las':  'LAS',
    'oce':  'OCE',
    'tr':   'TR1',
    'ru':   'RU',
    'jp':   'JP1',
    'sg':   'SG2',
}

const REGIONS = [
    { value: 'na',   label: 'NA' },
    { value: 'euw',  label: 'EUW' },
    { value: 'eune', label: 'EUNE' },
    { value: 'kr',   label: 'KR' },
    { value: 'br',   label: 'BR' },
    { value: 'lan',  label: 'LAN' },
    { value: 'las',  label: 'LAS' },
    { value: 'oce',  label: 'OCE' },
    { value: 'tr',   label: 'TR' },
    { value: 'ru',   label: 'RU' },
    { value: 'jp',   label: 'JP' },
    { value: 'sg',   label: 'SG' },
]

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
    const [riotId, setRiotId] = useState('')
    const [region, setRegion] = useState('na')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const trimmed = riotId.trim()
        if (!trimmed) return
        const tagLine = DEFAULT_TAGS[region] ?? region.toUpperCase()
        onSearch(region, trimmed, tagLine)
    }

    return  (
        <form className='search-bar' onSubmit={handleSubmit}>
            <select
                className='region-select'
                value={region}
                onChange={e => setRegion(e.target.value)}
            >
                {REGIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                ))}
            </select>
            <input
                className='search-input'
                type='text'
                placeholder='Player name'
                value={riotId}
                onChange={e => setRiotId(e.target.value)}
            />
            <button className='search-button' type='submit' disabled={loading}>
                {loading ? 'Searching...': 'Search'}
            </button>
        </form>
    )
}

