// Shimmer placeholder shaped like the table it stands in for,
// so the page doesn't jump when real rows arrive.
export default function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <table className='meta-table' aria-hidden='true'>
            <tbody>
                {Array.from({ length: rows }, (_, r) => (
                    <tr key={r}>
                        {Array.from({ length: cols }, (_, c) => (
                            <td key={c}><div className='skeleton skeleton-cell' /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
