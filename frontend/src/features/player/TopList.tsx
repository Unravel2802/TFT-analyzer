import type { UnitEntry, TraitEntry } from '@/types/tft'

interface Props {
    title: string
    entries: UnitEntry[] | TraitEntry[]
}

export default function TopList({ title, entries }: Props) {
    return (
        <div className="top-list">
            <h3>{title}</h3>
            <ul>
                {entries.map(([name, count]) => (
                    <li key={name}>
                        <span>{name}</span>
                        <span>{count}x</span>
                    </li>
                ))}
            </ul>
        </div>
    )
} 