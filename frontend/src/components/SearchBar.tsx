import { useState } from 'react'

interface Props {
    onSearch: (gameName: string, tagLine: string) => void
}

export default function SearchBar({ onSearch }: Props) {
    const [input, setInput] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const [gameName, tagLine] = input.split('#')

        if (!gameName || !tagLine) {
            alert('Please enter your Riot ID in the format: Name#TAG')
            return
        }


        onSearch(gameName.trim(), tagLine.trim())

    }
    return  (
    <form onSubmit={handleSubmit} className="search-form">
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

