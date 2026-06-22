interface Props {
    label: string
    value: string | number
}

export default function StatCard({ label, value }: Props) {
    return (
        <div className="stat-card">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
        </div>
    )
}