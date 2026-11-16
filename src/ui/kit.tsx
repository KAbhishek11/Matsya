import type { ButtonHTMLAttributes, ReactNode } from 'react'
import india from '@svg-maps/india'
import { fishSrc } from '../data/fish'

type Variant = 'default' | 'primary' | 'sun' | 'correct' | 'wrong' | 'muted'

export function Chunky({
  variant = 'default',
  size,
  icon,
  sub,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'sm' | 'round'
  icon?: ReactNode
  sub?: ReactNode
}) {
  const cls = ['chunky', variant !== 'default' && `chunky--${variant}`, size && `chunky--${size}`, className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" className={cls} {...rest}>
      {icon && <span className="chunky__icon" aria-hidden>{icon}</span>}
      <span>
        <span className="chunky__label">{children}</span>
        {sub && <span className="chunky__sub">{sub}</span>}
      </span>
    </button>
  )
}

export type CtaTone = 'blue' | 'green' | 'purple' | 'gold' | 'teal'

/** Home-menu call to action: its own colour, a glossy face and an illustrated icon that breaks out of the left edge. */
export function MenuCta({
  tone,
  icon,
  sub,
  size,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone: CtaTone; icon: string; sub?: ReactNode; size?: 'hero' | 'sm' }) {
  return (
    <button type="button" className={`cta cta--${tone} ${size ? `cta--${size}` : ''}`} {...rest}>
      <img className="cta__icon" src={art(`icon-${icon}`)} alt="" draggable={false} />
      <span className="cta__text">
        <span className="cta__label">{children}</span>
        {sub && <span className="cta__sub">{sub}</span>}
      </span>
    </button>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`panel ${className}`}>{children}</div>
}

export const art = (name: string) => `${import.meta.env.BASE_URL}art/${name}.webp`

export function Pin() {
  return <img className="pin" src={art('pin')} alt="" draggable={false} />
}

export function Polaroid({
  fishId,
  caption,
  tilt = 0,
  pin,
  hidden,
}: {
  fishId: string
  caption?: ReactNode
  tilt?: number
  pin?: boolean
  hidden?: boolean
}) {
  return (
    <div className="polaroid" style={{ rotate: `${tilt}deg` }}>
      {pin !== false && <Pin />}
      <div className="polaroid__photo">
        <img src={fishSrc(fishId)} alt={hidden ? 'A mystery fish' : ''} draggable={false} />
      </div>
      <div className="polaroid__caption">{caption}</div>
    </div>
  )
}

/** India outline from @svg-maps/india (CC BY 4.0) with the given states lit up. */
export function IndiaMap({ on, dim, label }: { on: string[]; dim?: boolean; label?: string }) {
  return (
    <svg className={`map ${dim ? 'map--dim' : ''}`} viewBox={india.viewBox} role="img" aria-label={label ?? 'Map of India'}>
      {india.locations.map((l) => (
        <path key={l.id} d={l.path} className={on.includes(l.id) ? 'on' : undefined} />
      ))}
    </svg>
  )
}

export function Flame({ size = 24 }: { size?: number }) {
  return <img src={art('flame')} alt="" width={size} height={size} style={{ objectFit: 'contain', verticalAlign: 'middle' }} draggable={false} />
}

export function FishImg({ id, className, style }: { id: string; className?: string; style?: React.CSSProperties }) {
  return <img src={fishSrc(id)} alt="" className={className} style={style} draggable={false} />
}
