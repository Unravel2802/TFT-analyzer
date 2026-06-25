interface PlaceholderPageProps {
    title: string
    note?: string
}

export default function PlaceholderPage({ title, note }: PlaceholderPageProps) {
    return (
        <div className='page'>
            <h1 className='page-title'>{title}</h1>
            <p className='page-tagline'>{note ?? 'Coming soon.'}</p>
        </div>
    )
}