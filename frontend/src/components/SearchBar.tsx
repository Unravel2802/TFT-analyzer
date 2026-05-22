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
            alert('Pllease enter your Riot ID in the format: Name#TAG')
            return
        }


        onSearch(gameName.trim(), tagLine.trim())

    }
    return  (
    <form onSubmit={handleSubmit}>
        <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Unravel2802#NA1"
        />
        <button type="submit">Search</button>
    </form>
    )
}

