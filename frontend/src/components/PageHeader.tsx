import type { ReactNode } from 'react'

interface HeadStat {
    label: string
    value: ReactNode
    /** optional tone tints the value: 'good' green, 'bad' red, default gold */
    tone?: 'good' | 'bad'
}

interface Props {
    title: string
    subtitle?: ReactNode
    /** small stat cluster pinned to the right of the header */
    stats?: HeadStat[]
    /** free-form right-side content (used instead of, or alongside, stats) */
    children?: ReactNode
}

/**
 * Shared page header for the signed-in "insight" pages (coach, climb, journal,
 * sessions). Left-aligned title + subtitle, with an optional right-side cluster
 * of summary stats — a calmer, more app-like replacement for the old centered
 * 48px glowing .page-title.
 */
export default function PageHeader({ title, subtitle, stats, children }: Props) {
    return (
        <header className='page-head'>
            <div className='page-head-text'>
                <h1 className='page-head-title'>{title}</h1>
                {subtitle && <p className='page-head-sub'>{subtitle}</p>}
            </div>
            {(stats || children) && (
                <div className='page-head-aside'>
                    {stats?.map(s => (
                        <div key={s.label} className='head-stat'>
                            <span className={`head-stat-value${s.tone ? ` head-stat-${s.tone}` : ''}`}>
                                {s.value}
                            </span>
                            <span className='head-stat-label'>{s.label}</span>
                        </div>
                    ))}
                    {children}
                </div>
            )}
        </header>
    )
}
