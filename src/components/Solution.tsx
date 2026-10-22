import { BellRing, Camera, FileText, SearchCheck } from 'lucide-react'
import { Eyebrow, Key, Reveal } from './ui'

const FEATURES = [
  {
    icon: Camera,
    title: 'Foto jadi data',
    body: 'Kirim foto struk, kemasan, atau voice note. Kala mengubahnya menjadi daftar bahan dan produk yang rapi.',
  },
  {
    icon: SearchCheck,
    title: 'Cek kelengkapan bukti',
    body: 'Kala mencocokkan bahan dengan registri BPJPH dan KMA 1360. Kalau bukti masih kurang, Kala menunjukkan langkah berikutnya dan opsi pemasok lain.',
  },
  {
    icon: FileText,
    title: 'Isi draf otomatis',
    body: 'Data disusun menjadi draf berkas yang siap dipindah ke pengajuan SiHalal, tanpa mengetik ulang.',
  },
  {
    icon: BellRing,
    title: 'Pantau status',
    body: 'Kala memantau status pengajuan dan mengabari saat ada revisi yang perlu dikerjakan.',
  },
]

const IMPACT = [
  { label: 'Target waktu isi berkas', value: 'dari hari ke menit' },
  { label: 'Target berkas dikembalikan', value: 'turun' },
  { label: 'Kanal', value: 'WhatsApp/Telegram' },
]

export default function Solution() {
  return (
    <section id="solusi" className="border-t border-line py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <Eyebrow>Solusi kami</Eyebrow>
          <h2 className="mt-3 text-h2 font-bold text-ink sm:text-h1 sm:font-extrabold">
            Kenalan dengan <Key>Kala</Key>, asisten berkas di aplikasi chat Anda
          </h2>
          <p className="mt-4 text-body text-ink-muted">
            Tidak perlu memasang aplikasi baru atau mempelajari sistem baru. Kala bekerja di chat yang sudah Anda pakai
            setiap hari.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="flex h-full gap-4 rounded-lg border border-line bg-surface-raised p-6">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-mint text-ink">
                  <f.icon size={24} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-body-sm text-ink-muted">{f.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-4">
          <div className="grid gap-4 rounded-lg bg-mint p-6 sm:grid-cols-3">
            {IMPACT.map((m) => (
              <div key={m.label}>
                <div className="text-label font-semibold text-ink-muted">{m.label}</div>
                <div className="mt-1 text-h3 font-bold text-ink">{m.value}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
