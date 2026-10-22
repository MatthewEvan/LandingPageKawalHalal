import { CheckCheck, Paperclip, Receipt, Send } from 'lucide-react'
import { StatusBadge } from './ui'

function Bubble({ from, delay, children }: { from: 'user' | 'kala'; delay: number; children: React.ReactNode }) {
  const mine = from === 'user'
  return (
    <div className={`bubble-in flex ${mine ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: `${delay}ms` }}>
      <div
        className={`max-w-[86%] rounded-lg px-3 py-2 text-[13px] leading-[18px] ${
          mine ? 'rounded-br-sm bg-mint text-ink' : 'rounded-bl-sm border border-line bg-surface-raised text-ink'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

function Row({ name, status }: { name: string; status: 'ada' | 'kurang' | 'tidak-jelas' }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-line py-1.5 first:border-t-0">
      <span>{name}</span>
      <StatusBadge status={status} />
    </div>
  )
}

export default function ChatMockup() {
  return (
    <figure className="mx-auto w-full max-w-[320px]">
      <div className="rounded-[2rem] border-[8px] border-brand-deep bg-brand-deep">
        <div className="overflow-hidden rounded-[1.5rem] bg-surface">
          <div className="bg-brand px-4 pb-3 pt-4 text-on-brand">
            <div className="text-body-sm font-bold">Kala dari KawalHalal</div>
            <div className="text-caption opacity-80">asisten berkas sertifikasi halal</div>
          </div>

          <div className="flex h-[460px] flex-col justify-end gap-2.5 overflow-hidden px-3 py-4">
            <Bubble from="user" delay={200}>
              <div className="mb-1.5 flex items-center gap-2 rounded-sm bg-surface-raised/70 p-2">
                <Receipt size={24} strokeWidth={1.75} className="text-ink-muted" />
                <div className="text-caption text-ink-muted">foto_struk_bahan.jpg</div>
              </div>
              Ini struk belanja bahan rendang saya
              <div className="mt-0.5 flex justify-end text-brand">
                <CheckCheck size={14} strokeWidth={1.75} />
              </div>
            </Bubble>

            <Bubble from="kala" delay={900}>
              Terima kasih, Bu. Ada 7 bahan di struk ini. Berikut kelengkapan buktinya:
              <div className="mt-2">
                <Row name="Daging sapi" status="ada" />
                <Row name="Santan kemasan" status="ada" />
                <Row name="Kecap manis curah" status="kurang" />
                <Row name="Bumbu racik" status="tidak-jelas" />
              </div>
            </Bubble>

            <Bubble from="kala" delay={1700}>
              Foto bumbu racik belum terbaca. Bisa Ibu kirim ulang foto kemasannya?
            </Bubble>

            <Bubble from="user" delay={2500}>
              Baik, saya foto ulang sekarang
            </Bubble>
          </div>

          <div className="flex items-center gap-2 border-t border-line bg-surface-raised px-3 py-2.5">
            <Paperclip size={18} strokeWidth={1.75} className="text-ink-muted" />
            <div className="flex-1 rounded-full bg-surface px-3 py-1.5 text-caption text-ink-muted">Kirim foto atau pesan</div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-on-brand">
              <Send size={16} strokeWidth={1.75} />
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-caption text-ink-muted">
        Ilustrasi alur percakapan. Produk masih dalam pengembangan.
      </figcaption>
    </figure>
  )
}
