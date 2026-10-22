import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from './ui'
import { buttonCls } from '../lib/styles'

const LINKS = [
  { href: '#masalah', label: 'Masalah' },
  { href: '#solusi', label: 'Solusi' },
  { href: '#cara-kerja', label: 'Cara kerja' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-surface transition-colors ${
        scrolled || open ? 'border-b border-line' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center rounded-sm" aria-label="KawalHalal, kembali ke atas">
          <Logo className="h-7 sm:h-8" />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-body-sm font-semibold text-ink-muted hover:text-brand">
              {l.label}
            </a>
          ))}
          <a href="#waitlist" className={buttonCls('primary', 'px-4 py-2 text-body-sm')}>
            Gabung waitlist
          </a>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-ink md:hidden"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} strokeWidth={1.75} /> : <Menu size={24} strokeWidth={1.75} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line px-4 pb-4 md:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 font-semibold text-ink">
              {l.label}
            </a>
          ))}
          <a href="#waitlist" onClick={() => setOpen(false)} className={buttonCls('primary', 'mt-2 w-full')}>
            Gabung waitlist
          </a>
        </div>
      )}
    </header>
  )
}
