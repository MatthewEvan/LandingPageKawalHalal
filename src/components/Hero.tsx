import { Users } from 'lucide-react'
import ChatMockup from './ChatMockup'
import Countdown from './Countdown'
import { Eyebrow, Kawung, Key, LinkButton } from './ui'
import { formatNumber } from '../lib/format'
import type { Stats } from '../lib/waitlist'

export default function Hero({ stats }: { stats: Stats | null }) {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Kawung di sudut kanan atas, di belakang mockup, tidak di belakang teks */}
      <Kawung className="absolute right-0 top-16 hidden h-[480px] w-[30%] lg:block" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Eyebrow>Asisten AI pemberkasan sertifikasi halal untuk UMK</Eyebrow>

          <h1 className="mt-4 text-h1 font-extrabold text-ink sm:text-display">
            Siapkan berkas sertifikasi halal cukup dengan <Key block>kirim foto</Key>
          </h1>

          <p className="mt-5 max-w-xl text-body text-ink-muted sm:text-[18px] sm:leading-[28px]">
            Kirim foto struk dan kemasan bahan lewat chat Telegram. Kala, asisten AI KawalHalal, mencocokkan
            bahan dengan registri BPJPH, menandai bukti yang masih kurang, lalu menyusun draf berkas SiHalal. Penetapan
            tetap dilakukan lewat proses BPJPH.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton>Gabung waitlist</LinkButton>
            <LinkButton href="#cara-kerja" variant="ghost">
              Lihat cara kerja
            </LinkButton>
          </div>

          <p className="mt-5 flex items-center gap-2 text-body-sm text-ink-muted">
            <Users size={20} strokeWidth={1.75} className="text-ink" />
            {stats && stats.total > 0 ? (
              <span>
                <b className="text-ink">{formatNumber(stats.total)} orang</b> dari {formatNumber(stats.provinsi)} provinsi
                sudah bergabung
              </span>
            ) : (
              <span>Daftar sekarang untuk akses awal saat pilot dibuka</span>
            )}
          </p>

          <div className="mt-10 rounded-lg border border-line bg-surface-raised p-4 sm:inline-block">
            <div className="mb-3 text-body-sm font-semibold text-ink">
              Wajib halal UMK berlaku <span className="text-brand">18 Oktober 2028</span>
            </div>
            <Countdown />
          </div>
        </div>

        <ChatMockup />
      </div>
    </section>
  )
}
