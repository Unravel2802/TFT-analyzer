import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
}

export default function Button({ variant = 'primary', className, ...rest }: Props) {
    const variantClass = variant === 'ghost' ? 'btn-ghost' : 'btn-primary'
    const classes = ['btn', variantClass, className].filter(Boolean).join(' ')
    return <button className={classes} {...rest} />
}
