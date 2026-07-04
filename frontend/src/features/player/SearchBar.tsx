import { useState } from 'react'
import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'
import { REGION_OPTIONS, defaultTagFor } from '@/lib/regions'

interface SearchBarProps {
    onSearch: (region: string, gameName: string, tagLine: string) => void
    loading?: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
    const [riotId, setRiotId] = useState('')
    const [region, setRegion] = useState('na')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const trimmed = riotId.trim()
        if (!trimmed) return

        let gameName = trimmed
        let tagLine = defaultTagFor(region)

        const hash = trimmed.indexOf('#')
        if (hash !== -1) {
            gameName = trimmed.slice(0, hash)
            const customTag = trimmed.slice(hash + 1).trim()
            if (customTag) tagLine = customTag
        }

        onSearch(region, gameName, tagLine)
    }

    return  (
        <form className='search-bar' onSubmit={handleSubmit}>
            <Dropdown options={REGION_OPTIONS} value={region} onChange={setRegion} />
            <input
                className='search-input'
                type='text'
                placeholder='Player name'
                value={riotId}
                onChange={e => setRiotId(e.target.value)}
            />
            <Button type='submit' disabled={loading}>
                {loading ? 'Searching...': 'Search'}
            </Button>
        </form>
    )
}

