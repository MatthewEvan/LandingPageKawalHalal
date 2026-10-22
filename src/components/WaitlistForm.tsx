import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Copy, Loader2, Send } from 'lucide-react'
import {
  JENIS_USAHA,
  KENDALA,
  KESEDIAAN_BAYAR,
  PERAN,
  PROVINSI,
  STATUS_HALAL,
  type Option,
} from '../data/options'
import {
  isDemoMode,
  joinWaitlist,
  updateProfile,
  WaitlistError,
  type JoinResult,
  type ProfileInput,
  type Stats,
} from '../lib/waitlist'
import { Kawung, Logo } from './ui'
import { buttonCls } from '../lib/styles'
import { formatNumber } from '../lib/format'

const SAVED_KEY = 'kh_waitlist_entry'

type Saved = { referralCode: string; position: number }

function loadSaved(): Saved | null {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_KEY) ?? 'null') as Saved | null
    // Dibuka dari tautan ajakan orang lain: tampilkan form kosong, bukan status pendaftaran sendiri
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (saved && ref && ref.toUpperCase() !== saved.referralCode.toUpperCase()) return null
    return saved
  } catch {
    return null
  }
}

function clearSaved() {
  try {
    localStorage.removeItem(SAVED_KEY)
  } catch {
    /* abaikan */
  }
}

function save(entry: Saved) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(entry))
  } catch {
    /* abaikan */
  }
}

function readUrlParams() {
  const p = new URLSearchParams(window.location.search)
  return {
    ref: p.get('ref'),
    utm: { source: p.get('utm_source'), medium: p.get('utm_medium'), campaign: p.get('utm_campaign') },
  }
}

const inputCls =
  'w-full rounded-sm border border-line-strong bg-surface-raised px-3 py-3 text-body text-ink placeholder:text-ink-muted/70'

function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-label font-semibold text-ink">
        {label} {hint && <span className="font-normal text-ink-muted">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex gap-2 rounded-md bg-status-risk-bg px-3 py-2.5 text-body-sm text-status-risk">
      <CircleAlert size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
      {children}
    </p>
  )
}

function Chips({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: Option[]
  value: string | string[]
  onChange: (v: string) => void
  multi?: boolean
}) {
  const selected = (v: string) => (multi ? (value as string[]).includes(v) : value === v)
  return (
    <div className="flex flex-wrap gap-2" role={multi ? 'group' : 'radiogroup'}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role={multi ? 'checkbox' : 'radio'}
          aria-checked={selected(o.value)}
          onClick={() => onChange(o.value)}
          className={`rounded-sm border px-3 py-2 text-body-sm transition-colors ${
            selected(o.value)
              ? 'border-brand bg-mint font-semibold text-ink'
              : 'border-line-strong bg-surface-raised text-ink hover:bg-mint'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------------- */

function StepOne({ onDone }: { onDone: (r: JoinResult, peran: string) => void }) {
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [wa, setWa] = useState('')
  const [peran, setPeran] = useState('')
  const [provinsi, setProvinsi] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const startedAt = useRef(Date.now())

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')

    if (nama.trim().length < 2) return setError('Nama belum diisi. Tulis nama Anda.')
    if (!email.trim() && !wa.trim()) return setError('Kontak belum diisi. Isi email atau nomor WhatsApp, salah satu cukup.')
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError('Format email belum sesuai. Periksa lagi penulisannya.')
    if (wa && wa.replace(/\D/g, '').length < 9) return setError('Nomor WhatsApp terlalu pendek. Periksa lagi nomornya.')
    if (!peran) return setError('Jenis usaha belum dipilih. Pilih UMK atau usaha reguler.')
    if (!provinsi) return setError('Provinsi belum dipilih. Pilih provinsi Anda.')
    if (!consent) return setError('Persetujuan data belum dicentang. Centang kotak persetujuan untuk melanjutkan.')

    // Bot biasanya mengisi field tersembunyi atau submit terlalu cepat
    if (honeypot || Date.now() - startedAt.current < 2500) {
      onDone({ alreadyRegistered: false, referralCode: '', position: 0, editToken: null }, peran)
      return
    }

    setLoading(true)
    try {
      const { ref, utm } = readUrlParams()
      const res = await joinWaitlist({
        nama: nama.trim(),
        email: email.trim(),
        whatsapp: wa.trim(),
        peran,
        provinsi,
        referredBy: ref,
        utm,
      })
      onDone(res, peran)
    } catch (err) {
      setError(err instanceof WaitlistError ? err.message : 'Pendaftaran belum terkirim. Coba kirim lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h3 className="text-h2 font-bold text-ink">Daftar waitlist</h3>
        <p className="mt-1 text-body-sm text-ink-muted">Kurang dari satu menit.</p>
      </div>

      <Field label="Nama" htmlFor="nama">
        <input id="nama" className={inputCls} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Anda" autoComplete="name" maxLength={100} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email">
          <input id="email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" />
        </Field>
        <Field label="WhatsApp" htmlFor="wa">
          <input id="wa" type="tel" inputMode="tel" className={inputCls} value={wa} onChange={(e) => setWa(e.target.value)} placeholder="08xx xxxx xxxx" autoComplete="tel" />
        </Field>
      </div>
      <p className="-mt-3 text-caption text-ink-muted">Isi salah satu. Kami menghubungi Anda lewat kontak ini saat pilot dibuka.</p>

      <Field label="Usaha Anda termasuk">
        <div className="grid gap-2 sm:grid-cols-2">
          {PERAN.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={peran === p.value}
              onClick={() => setPeran(p.value)}
              className={`rounded-md border p-3 text-left transition-colors ${
                peran === p.value ? 'border-brand bg-mint' : 'border-line-strong bg-surface-raised hover:bg-mint'
              }`}
            >
              <div className="text-body-sm font-bold text-ink">{p.label}</div>
              <div className="text-caption text-ink-muted">{p.hint}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Provinsi" htmlFor="provinsi">
        <select id="provinsi" className={inputCls} value={provinsi} onChange={(e) => setProvinsi(e.target.value)}>
          <option value="">Pilih provinsi</option>
          {PROVINSI.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </Field>

      {/* Honeypot: disembunyikan dari manusia */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <label className="flex cursor-pointer gap-3 rounded-md bg-mint p-3 text-body-sm text-ink">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
        />
        <span>
          Saya setuju data ini dipakai tim KawalHalal untuk menghubungi saya soal akses awal dan untuk riset produk. Data
          tidak dijual ke pihak lain.
        </span>
      </label>

      {error && <ErrorNote>{error}</ErrorNote>}

      <button type="submit" aria-busy={loading} className={buttonCls('primary', 'w-full')}>
        {loading && <Loader2 className="animate-spin" size={20} strokeWidth={1.75} />}
        {loading ? 'Mendaftarkan' : 'Daftar sekarang'}
      </button>
    </form>
  )
}

/* ------------------------------------------------------------------------- */

function StepTwo({ editToken, peran, onDone }: { editToken: string; peran: string; onDone: () => void }) {
  const [form, setForm] = useState<ProfileInput>({
    kota: '',
    jenisUsaha: '',
    statusHalal: '',
    kendala: [],
    kesediaanBayar: '',
    catatan: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (k: 'jenisUsaha' | 'statusHalal' | 'kesediaanBayar') => (v: string) =>
    set(k, form[k] === v ? '' : v)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      await updateProfile(editToken, form)
      onDone()
    } catch (err) {
      setError(err instanceof WaitlistError ? err.message : 'Jawaban belum tersimpan. Coba kirim lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex gap-3 rounded-md bg-status-ok-bg p-3 text-body-sm text-status-ok">
        <CircleCheck size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
        <span>
          <b>Anda sudah masuk waitlist.</b> Jawaban di bawah membantu kami membangun fitur yang tepat. Semua opsional.
        </span>
      </div>

      <Field label="Jenis usaha">
        <Chips options={JENIS_USAHA} value={form.jenisUsaha} onChange={toggle('jenisUsaha')} />
      </Field>

      <Field label="Status sertifikasi halal saat ini">
        <Chips options={STATUS_HALAL} value={form.statusHalal} onChange={toggle('statusHalal')} />
      </Field>

      <Field label="Kendala terbesar" hint="(boleh pilih beberapa)">
        <Chips
          multi
          options={KENDALA}
          value={form.kendala}
          onChange={(v) => set('kendala', form.kendala.includes(v) ? form.kendala.filter((x) => x !== v) : [...form.kendala, v])}
        />
      </Field>

      <Field label="Kalau KawalHalal membantu, berapa biaya yang wajar per pengajuan sertifikasi?">
        <Chips options={KESEDIAAN_BAYAR[peran] ?? KESEDIAAN_BAYAR.umk} value={form.kesediaanBayar} onChange={toggle('kesediaanBayar')} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Kota atau kabupaten" htmlFor="kota">
          <input id="kota" className={inputCls} value={form.kota} onChange={(e) => set('kota', e.target.value)} placeholder="cth. Bandung" maxLength={80} />
        </Field>
        <Field label="Cerita atau masukan" htmlFor="catatan">
          <input id="catatan" className={inputCls} value={form.catatan} onChange={(e) => set('catatan', e.target.value)} placeholder="Opsional" maxLength={500} />
        </Field>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onDone} className={buttonCls('ghost')}>
          Lewati
        </button>
        <button type="submit" aria-busy={loading} className={buttonCls('primary')}>
          {loading && <Loader2 className="animate-spin" size={20} strokeWidth={1.75} />}
          Kirim jawaban
        </button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------------- */

function Done({ entry, alreadyRegistered, onReset }: { entry: Saved; alreadyRegistered: boolean; onReset: () => void }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}${window.location.pathname}?ref=${entry.referralCode}`
  const shareText =
    'Saya sudah daftar waitlist KawalHalal, asisten AI yang membantu UMK menyiapkan berkas sertifikasi halal lewat chat. Daftar juga di sini:'

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  if (!entry.referralCode) {
    return (
      <div className="py-6 text-center">
        <CircleCheck className="mx-auto text-status-ok" size={24} strokeWidth={1.75} />
        <h3 className="mt-3 text-h2 font-bold text-ink">Terima kasih</h3>
        <p className="mt-2 text-body text-ink-muted">Pendaftaran Anda sudah kami terima.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-status-ok">
        <CircleCheck size={24} strokeWidth={1.75} aria-hidden />
        <span className="text-label font-semibold">Terdaftar</span>
      </div>
      <h3 className="mt-2 text-h2 font-bold text-ink">
        {alreadyRegistered ? 'Kontak ini sudah terdaftar sebelumnya' : 'Anda sudah masuk waitlist'}
      </h3>
      <div className="mt-4 rounded-md border border-line p-4">
        <div className="text-label font-semibold text-ink-muted">Nomor antrean</div>
        <div className="text-display font-extrabold text-brand">{formatNumber(entry.position)}</div>
      </div>

      <div className="mt-6">
        <h4 className="text-h3 font-bold text-ink">Ajak sesama pelaku usaha</h4>
        <p className="mt-1 text-body-sm text-ink-muted">
          Bagikan tautan ini ke sesama pelaku usaha yang sedang mengurus sertifikasi halal.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            readOnly
            value={link}
            className={`${inputCls} truncate font-mono text-[13px]`}
            onFocus={(e) => e.target.select()}
            aria-label="Tautan ajakan"
          />
          <button type="button" onClick={copy} className={buttonCls('primary', 'shrink-0 px-4')}>
            <Copy size={20} strokeWidth={1.75} aria-hidden />
            {copied ? 'Tersalin' : 'Salin'}
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonCls('secondary', 'text-body-sm')}
          >
            <Send size={16} strokeWidth={1.75} aria-hidden /> Bagikan ke WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonCls('secondary', 'text-body-sm')}
          >
            <Send size={16} strokeWidth={1.75} aria-hidden /> Bagikan ke Telegram
          </a>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-4 text-center">
        <button type="button" onClick={onReset} className={buttonCls('ghost', 'text-body-sm')}>
          Daftarkan usaha lain
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- */

export default function WaitlistSection({ stats, onJoined }: { stats: Stats | null; onJoined: () => void }) {
  const [entry, setEntry] = useState<Saved | null>(loadSaved)
  const [step, setStep] = useState<'form' | 'profile' | 'done'>(() => (entry ? 'done' : 'form'))
  const [result, setResult] = useState<JoinResult | null>(null)
  const [peran, setPeran] = useState('umk')
  const cardRef = useRef<HTMLDivElement>(null)

  function reset() {
    clearSaved()
    setEntry(null)
    setResult(null)
    setStep('form')
  }

  function handleJoined(r: JoinResult, p: string) {
    setResult(r)
    setPeran(p)
    const saved = { referralCode: r.referralCode, position: r.position }
    setEntry(saved)
    if (r.referralCode) save(saved)
    setStep(r.editToken ? 'profile' : 'done')
    onJoined()
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="waitlist" className="on-deep relative overflow-hidden bg-brand-deep py-16 sm:py-24">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="text-on-deep">
          <div className="mb-4 h-1 w-12 rounded-full bg-accent" aria-hidden />
          <h2 className="text-h2 font-bold sm:text-h1 sm:font-extrabold">
            Dapatkan akses awal
            <Logo onDeep className="mt-2 h-[1.5em]" style={{ display: 'block' }} />
          </h2>
          <p className="mt-4 text-body text-on-deep/85">
            Kami sedang menyiapkan pilot bersama pelaku usaha UMK dan reguler. Pendaftar waitlist mendapat akses awal tanpa biaya
            dan ikut menentukan fitur yang dibangun.
          </p>

          <ul className="mt-6 space-y-3 text-body">
            {['Akses awal tanpa biaya selama pilot', 'Didampingi langsung oleh tim', 'Masukan Anda ikut membentuk produk'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CircleCheck size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
                {t}
              </li>
            ))}
          </ul>

          {stats && stats.total > 0 && (
            <div className="mt-8 grid grid-cols-3 gap-2">
              {[
                ['Pendaftar', stats.total],
                ['UMK', stats.umk],
                ['Usaha reguler', stats.reguler],
              ].map(([label, n]) => (
                <div key={label} className="rounded-md bg-brand p-3">
                  <div className="text-h2 font-extrabold">{formatNumber(n as number)}</div>
                  <div className="text-caption opacity-80">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Kawung dalam alur kolom kiri, di bawah konten, tidak di belakang teks */}
          <Kawung tone="accent" className="mt-10 hidden h-[192px] w-full lg:block" />
        </div>

        <div ref={cardRef} className="scroll-mt-24 rounded-lg border border-line bg-surface-raised p-5 sm:p-8">
          {isDemoMode && (
            <p className="mb-5 flex gap-2 rounded-md bg-status-warn-bg px-3 py-2 text-caption text-status-warn">
              <CircleAlert size={16} strokeWidth={1.75} className="shrink-0" aria-hidden />
              Mode demo: Supabase belum dikonfigurasi. Data hanya tersimpan di browser ini.
            </p>
          )}
          {step === 'form' && <StepOne onDone={handleJoined} />}
          {step === 'profile' && result?.editToken && <StepTwo editToken={result.editToken} peran={peran} onDone={() => setStep('done')} />}
          {step === 'done' && entry && <Done entry={entry} alreadyRegistered={result?.alreadyRegistered ?? false} onReset={reset} />}
        </div>
      </div>
    </section>
  )
}
