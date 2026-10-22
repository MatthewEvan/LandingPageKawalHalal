import { Key, LinkButton, Logo } from './ui'

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="text-h2 font-bold text-ink sm:text-h1 sm:font-extrabold">
          Penetapan tetap lewat BPJPH.
          <br />
          <Key>Berkasnya</Key> biar Kala yang siapkan.
        </p>
        <LinkButton className="mt-8">Gabung waitlist</LinkButton>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-body-sm text-ink-muted sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Logo className="h-6" />
            <span>© {new Date().getFullYear()}</span>
          </div>
          <span>Proyek hackathon, dibuat di Bandung</span>
        </div>
      </div>
    </footer>
  )
}
