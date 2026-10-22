import { ChevronDown } from 'lucide-react'
import { Eyebrow, Reveal } from './ui'

const FAQ = [
  {
    q: 'Apa itu KawalHalal?',
    a: 'KawalHalal adalah asisten AI bernama Kala yang membantu UMK menyiapkan berkas sertifikasi halal lewat chat WhatsApp/Telegram. Anda mengirim foto struk dan kemasan bahan, Kala menyusun data dan kelengkapan buktinya.',
  },
  {
    q: 'Apakah KawalHalal menentukan produk saya halal?',
    a: 'Tidak. KawalHalal hanya membantu menyiapkan kelengkapan bukti dan menunjukkan kemungkinan jalur sertifikasi. Penetapan dilakukan lewat proses BPJPH, dengan pemeriksaan oleh pendamping P3H atau LPH.',
  },
  {
    q: 'Apakah KawalHalal menggantikan P3H?',
    a: 'Tidak. Pendamping P3H tetap memeriksa dan memutuskan. KawalHalal membuat berkas yang masuk ke P3H lebih tersusun, sehingga pemeriksaan lebih cepat.',
  },
  {
    q: 'Kenapa perlu mulai sekarang?',
    a: 'Kewajiban sertifikasi halal untuk produk UMK berlaku 18 Oktober 2028. Mulai lebih awal memberi waktu untuk melengkapi bukti atau mengganti pemasok bila diperlukan.',
  },
  {
    q: 'Apakah ada biaya untuk memakai KawalHalal?',
    a: 'Pendaftar waitlist mendapat akses awal tanpa biaya selama masa pilot. Skema langganan setelahnya sedang disusun. Biaya sertifikasi itu sendiri mengikuti ketentuan BPJPH dan LPH, bukan KawalHalal.',
  },
  {
    q: 'Data saya dipakai untuk apa?',
    a: 'Hanya untuk menghubungi Anda soal akses awal dan untuk memahami kebutuhan pengguna. Kami tidak menjual data ke pihak lain.',
  },
  {
    q: 'Kapan KawalHalal bisa dipakai?',
    a: 'Saat ini kami di tahap pengembangan MVP dan validasi pilot. Pendaftar waitlist dikabari lebih dulu saat pilot dibuka.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 text-h2 font-bold text-ink sm:text-h1 sm:font-extrabold">Pertanyaan yang sering muncul</h2>
        </Reveal>
        <div className="mt-8 space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-lg border border-line bg-surface-raised p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-h3 font-bold text-ink">
                {f.q}
                <ChevronDown size={20} strokeWidth={1.75} className="shrink-0 text-ink-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-body text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
