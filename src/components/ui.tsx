import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, CircleX } from 'lucide-react'
import { buttonCls, type ButtonVariant } from '../lib/styles'
import logoGreen from '../assets/logo-green.png'
import logoYellow from '../assets/logo-yellow.png'

/** Logo KawalHalal: versi hijau di latar terang, versi kuning di atas brand-deep. Tinggi diatur lewat className. */
export function Logo({
  className = 'h-8',
  onDeep = false,
  style,
}: {
  className?: string
  onDeep?: boolean
  style?: CSSProperties
}) {
  return (
    <img
      src={onDeep ? logoYellow : logoGreen}
      alt="KawalHalal"
      width={1065}
      height={244}
      className={`inline-block w-auto ${className}`}
      style={style}
    />
  )
}

/** Satu frasa kunci per judul: warna brand, atau blok accent (saffron, sekali per layar). */
export function Key({ children, block = false }: { children: ReactNode; block?: boolean }) {
  if (block) {
    return <span className="rounded-sm bg-accent px-1.5 text-on-accent [box-decoration-break:clone]">{children}</span>
  }
  return <span className="text-brand">{children}</span>
}

export function Eyebrow({ children, onDeep = false }: { children: ReactNode; onDeep?: boolean }) {
  return (
    <span className={`text-label font-semibold uppercase tracking-wider ${onDeep ? 'text-on-deep/80' : 'text-brand'}`}>
      {children}
    </span>
  )
}

export function LinkButton({
  href = '#waitlist',
  variant = 'primary',
  children,
  className = '',
}: {
  href?: string
  variant?: ButtonVariant
  children: ReactNode
  className?: string
}) {
  return (
    <a href={href} className={buttonCls(variant, className)}>
      {children}
    </a>
  )
}

type Status = 'ada' | 'kurang' | 'tidak-jelas'

const STATUS: Record<Status, { label: string; cls: string; Icon: typeof CircleCheck }> = {
  ada: { label: 'Ada', cls: 'bg-status-ok-bg text-status-ok', Icon: CircleCheck },
  kurang: { label: 'Kurang', cls: 'bg-status-risk-bg text-status-risk', Icon: CircleX },
  'tidak-jelas': { label: 'Tidak jelas', cls: 'bg-status-warn-bg text-status-warn', Icon: CircleAlert },
}

/** Badge status bukti: selalu ikon + label, tidak hanya warna. */
export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label font-semibold ${s.cls}`}>
      <s.Icon size={14} strokeWidth={1.75} aria-hidden />
      {s.label}
    </span>
  )
}

/** Pola kawung dekoratif. Letakkan di sudut, jangan di belakang teks. */
export function Kawung({ tone = 'line', className = '' }: { tone?: 'line' | 'accent'; className?: string }) {
  return <div aria-hidden className={`pointer-events-none ${tone === 'line' ? 'kawung-line' : 'kawung-accent'} ${className}`} />
}

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
