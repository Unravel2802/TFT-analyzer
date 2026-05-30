import { useState } from 'react'

const REGIONS = ['NA1', 'EUW1', 'KR', 'BR1']

interface Props {
    onSearch: (region: string, gameName: string, tagLine: string) => void
}

export default function SearchBar({ onSearch }: Props) {
    const [input, setInput] = useState('')
    const [region, setRegion] = useState('NA1')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const [gameName, tagLine] = input.split('#')

        if (!gameName || !tagLine) {
            alert('Please enter your Riot ID in the format: Name#TAG')
            return
        }


        onSearch(region, gameName.trim(), tagLine.trim())

    }
    return  (
    <form onSubmit={handleSubmit} className="search-form">
        <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="region-select"
        >
            {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
            ))}
        </select>
        <input 
            className='search-input'
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Unravel2802#NA1"
        />
        <button type="submit" className="search-button">Search</button>
    </form>
    )
}

