import { Gavel, TrendingDown, UsersRound } from 'lucide-react'
import { Eyebrow, Key, Reveal } from './ui'

const STATS = [
  {
    icon: TrendingDown,
    big: '26,7 juta',
    title: 'UMK belum bersertifikat halal',
    body: 'Dari 30,2 juta UMK nonpertanian dan perikanan, baru sekitar 3,52 juta pelaku usaha yang bersertifikat.',
  },
  {
    icon: Gavel,
    big: 'Rp2 miliar',
    title: 'Denda maksimal',
    body: 'Sanksi mulai dari teguran, denda, sampai penarikan produk dari peredaran setelah tenggat lewat.',
  },
  {
    icon: UsersRound,
    big: '111.000+',
    title: 'P3H memikul verifikasi',
    body: 'Pendamping Proses Produk Halal mengecek bukti bahan satu per satu untuk jutaan usaha.',
  },
]

export default function Problem() {
  return (
    <section id="masalah" className="border-t border-line py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <Eyebrow>Status quo</Eyebrow>
          <h2 className="mt-3 text-h2 font-bold text-ink sm:text-h1 sm:font-extrabold">
            Niatnya ada. Yang menghambat adalah <Key>prosedurnya</Key>.
          </h2>
          <p className="mt-4 text-body text-ink-muted">
            Pemilik usaha perlu mengumpulkan bukti tiap bahan, mengurus NIB, lalu mengisi formulir SiHalal yang panjang.
            Bagi yang jarang berurusan dengan layanan digital, proses ini sering berhenti di tengah jalan.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="h-full rounded-lg border border-line bg-surface-raised p-6">
                <s.icon className="text-ink-muted" size={24} strokeWidth={1.75} />
                <div className="mt-4 text-h1 font-extrabold text-brand sm:text-display">{s.big}</div>
                <h3 className="mt-1 text-h3 font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-body-sm text-ink-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 text-caption text-ink-muted">Sumber: data riset tim KawalHalal, 2025.</p>
      </div>
    </section>
  )
}
