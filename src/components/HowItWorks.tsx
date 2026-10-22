import { useState } from 'react'
import { Check } from 'lucide-react'
import { Eyebrow, Key, Reveal } from './ui'

const STEPS = [
  { title: 'Terima langkah dan syarat', body: 'Kala mengirim langkah dan syarat sertifikasi sesuai jenis usaha Anda.' },
  { title: 'Siapkan dokumen', body: 'Kala memberi daftar dokumen yang dibutuhkan dan mengingatkan soal NIB.' },
  { title: 'Kirim foto', body: 'Foto struk dan kemasan bahan diubah menjadi isian yang siap dipindah ke SiHalal.' },
  { title: 'Lihat celah bukti', body: 'Bahan dengan bukti kurang atau tidak jelas ditandai, lengkap dengan langkah berikutnya.' },
  { title: 'Serahkan ke P3H', body: 'Semua berkas dirangkum dalam satu paket untuk diperiksa pendamping P3H.' },
]

const AUDIENCE = {
  umk: {
    label: 'Usaha Mikro dan Kecil',
    points: [
      'Cukup kirim foto dan jawab satu pertanyaan per pesan.',
      'Tahu sejak awal bukti bahan mana yang masih kurang.',
      'Berkas tersusun rapi sebelum diperiksa pendamping P3H.',
      'Diingatkan saat ada revisi, jadi pengajuan tidak terbengkalai.',
    ],
  },
  reguler: {
    label: 'Usaha reguler',
    points: [
      'Daftar bahan dan bukti pemasok tersusun dari foto struk dan kemasan.',
      'Bahan dengan bukti kurang ditandai sebelum pemeriksaan LPH.',
      'Draf berkas siap dipindah ke pengajuan SiHalal.',
      'Status pengajuan dan revisi dipantau lewat Telegram.',
    ],
  },
}

export default function HowItWorks() {
  const [tab, setTab] = useState<keyof typeof AUDIENCE>('umk')

  return (
    <section id="cara-kerja" className="border-t border-line py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <Eyebrow>Cara kerja</Eyebrow>
          <h2 className="mt-3 text-h2 font-bold text-ink sm:text-h1 sm:font-extrabold">
            Lima langkah, <Key>semuanya dari chat</Key>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <div className="flex h-full gap-4 rounded-lg border border-line bg-surface-raised p-4 lg:flex-col lg:gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-label font-bold text-on-accent">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-body-sm text-ink-muted">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <div className="rounded-lg border border-line bg-surface-raised p-6 sm:p-8">
            <h3 className="text-h2 font-bold text-ink">Untuk siapa KawalHalal?</h3>
            <div className="mt-5 inline-flex rounded-md border border-line-strong p-1" role="tablist">
              {(Object.keys(AUDIENCE) as (keyof typeof AUDIENCE)[]).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`rounded-sm px-4 py-2 text-label font-semibold transition-colors ${
                    tab === k ? 'bg-brand text-on-brand' : 'text-ink hover:bg-mint'
                  }`}
                >
                  {AUDIENCE[k].label}
                </button>
              ))}
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2" role="tabpanel">
              {AUDIENCE[tab].points.map((p) => (
                <li key={p} className="flex gap-3 rounded-md bg-surface p-4 text-body-sm text-ink">
                  <Check size={20} strokeWidth={1.75} className="shrink-0 text-brand" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
