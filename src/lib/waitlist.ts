import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null

/** Tanpa env Supabase, halaman jalan dalam mode demo (data disimpan di localStorage). */
export const isDemoMode = supabase === null

export type Stats = { total: number; umk: number; reguler: number; provinsi: number }

export type JoinInput = {
  nama: string
  email: string
  whatsapp: string
  peran: string
  provinsi: string
  referredBy: string | null
  utm: { source: string | null; medium: string | null; campaign: string | null }
}

export type JoinResult = {
  alreadyRegistered: boolean
  referralCode: string
  position: number
  editToken: string | null
}

export type ProfileInput = {
  kota: string
  jenisUsaha: string
  statusHalal: string
  kendala: string[]
  kesediaanBayar: string
  catatan: string
}

export class WaitlistError extends Error {}

const DEMO_KEY = 'kh_demo_waitlist'

type DemoRow = { email: string; whatsapp: string; peran: string; provinsi: string; code: string }

function readDemo(): DemoRow[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '[]') as DemoRow[]
  } catch {
    return []
  }
}

function writeDemo(rows: DemoRow[]) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(rows))
  } catch {
    /* abaikan: private mode */
  }
}

/** 08xx / +62xx / 62xx -> 62xx, angka saja. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  if (digits.startsWith('8')) digits = '62' + digits
  return digits
}

function friendlyError(message: string): string {
  if (message.includes('rate_limited')) return 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi dalam satu jam.'
  if (message.includes('consent_required')) return 'Persetujuan data belum dicentang. Centang kotak persetujuan lalu kirim lagi.'
  if (message.includes('violates check constraint')) return 'Format email atau nomor WhatsApp belum sesuai. Periksa lagi lalu kirim ulang.'
  return 'Pendaftaran belum terkirim. Periksa koneksi internet lalu coba lagi.'
}

export async function getStats(): Promise<Stats> {
  if (!supabase) {
    const rows = readDemo()
    return {
      total: rows.length,
      umk: rows.filter((r) => r.peran === 'umk').length,
      reguler: rows.filter((r) => r.peran === 'reguler').length,
      provinsi: new Set(rows.map((r) => r.provinsi)).size,
    }
  }
  const { data, error } = await supabase.rpc('get_waitlist_stats')
  if (error) throw new WaitlistError(error.message)
  return data as Stats
}

export async function joinWaitlist(input: JoinInput): Promise<JoinResult> {
  const whatsapp = input.whatsapp ? normalizePhone(input.whatsapp) : ''

  if (!supabase) {
    await new Promise((r) => setTimeout(r, 600))
    const rows = readDemo()
    const email = input.email.trim().toLowerCase()
    const idx = rows.findIndex((r) => (email && r.email === email) || (whatsapp && r.whatsapp === whatsapp))
    if (idx >= 0) {
      return { alreadyRegistered: true, referralCode: rows[idx].code, position: idx + 1, editToken: null }
    }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    rows.push({ email, whatsapp, peran: input.peran, provinsi: input.provinsi, code })
    writeDemo(rows)
    return { alreadyRegistered: false, referralCode: code, position: rows.length, editToken: 'demo' }
  }

  const { data, error } = await supabase.rpc('join_waitlist', {
    p_nama: input.nama,
    p_email: input.email || null,
    p_whatsapp: whatsapp || null,
    p_peran: input.peran,
    p_provinsi: input.provinsi,
    p_referred_by: input.referredBy,
    p_utm_source: input.utm.source,
    p_utm_medium: input.utm.medium,
    p_utm_campaign: input.utm.campaign,
    p_consent: true,
  })
  if (error) throw new WaitlistError(friendlyError(error.message))

  const res = data as { already_registered: boolean; referral_code: string; position: number; edit_token: string | null }
  return {
    alreadyRegistered: res.already_registered,
    referralCode: res.referral_code,
    position: res.position,
    editToken: res.edit_token,
  }
}

export async function updateProfile(editToken: string, input: ProfileInput): Promise<void> {
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 500))
    return
  }
  const { error } = await supabase.rpc('update_waitlist_profile', {
    p_edit_token: editToken,
    p_kota: input.kota,
    p_jenis_usaha: input.jenisUsaha,
    p_status_halal: input.statusHalal,
    p_kendala: input.kendala,
    p_kesediaan_bayar: input.kesediaanBayar,
    p_catatan: input.catatan,
  })
  if (error) throw new WaitlistError(friendlyError(error.message))
}

export async function getReferralCount(code: string): Promise<number> {
  if (!supabase) return 0
  const { data, error } = await supabase.rpc('get_referral_count', { p_code: code })
  if (error) return 0
  return Number(data ?? 0)
}
