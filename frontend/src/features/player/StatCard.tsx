interface Props {
    label: string
    value: string | number
    /** Colors the value green/red — for stats with a clear better/worse reading. */
    tone?: 'good' | 'bad'
}

export default function StatCard({ label, value, tone }: Props) {
    return (
        <div className="stat-card">
            <span className={`stat-value${tone ? ` ${tone}` : ''}`}>{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    )
}
