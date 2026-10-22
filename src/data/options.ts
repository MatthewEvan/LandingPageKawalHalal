export type Option = { value: string; label: string; hint?: string }

// Dua segmen pendaftar, mengikuti dua tahap pendaftaran di SiHalal
export const PERAN: Option[] = [
  { value: 'umk', label: 'Usaha Mikro dan Kecil (UMK)', hint: 'Usaha rumahan, warung, atau usaha kecil' },
  { value: 'reguler', label: 'Usaha reguler', hint: 'Bukan UMK, misalnya usaha menengah atau pabrik' },
]

export const PROVINSI = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Bengkulu',
  'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Lampung', 'Banten', 'DKI Jakarta', 'Jawa Barat',
  'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan',
  'Sulawesi Tenggara', 'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Barat Daya',
  'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan', 'Luar negeri',
]

export const JENIS_USAHA: Option[] = [
  { value: 'makanan_berat', label: 'Makanan berat / katering' },
  { value: 'jajanan', label: 'Jajanan & kue' },
  { value: 'minuman', label: 'Minuman' },
  { value: 'frozen', label: 'Frozen food' },
  { value: 'bumbu', label: 'Bumbu & sambal' },
  { value: 'kosmetik', label: 'Kosmetik / perawatan' },
  { value: 'lainnya', label: 'Lainnya' },
]

export const STATUS_HALAL: Option[] = [
  { value: 'belum', label: 'Belum mulai' },
  { value: 'proses', label: 'Sedang proses' },
  { value: 'sudah', label: 'Sudah bersertifikat' },
]

export const KENDALA: Option[] = [
  { value: 'dokumen', label: 'Bingung dokumen apa saja yang perlu' },
  { value: 'nib', label: 'Belum punya / ribet urus NIB' },
  { value: 'bahan', label: 'Tidak tahu bahan mana yang aman' },
  { value: 'supplier', label: 'Supplier bahan belum bersertifikat' },
  { value: 'sihalal', label: 'Susah mengisi SiHalal' },
  { value: 'revisi', label: 'Berkas sering dikembalikan' },
  { value: 'waktu', label: 'Tidak sempat, sibuk jualan' },
  { value: 'biaya', label: 'Khawatir biaya' },
]

// Pilihan biaya berbeda per segmen
export const KESEDIAAN_BAYAR: Record<string, Option[]> = {
  umk: [
    { value: '25rb', label: 'Rp25 ribu' },
    { value: '50rb', label: 'Rp50 ribu' },
    { value: '50-100rb', label: 'Rp50–100 ribu' },
    { value: '>100rb', label: 'Lebih dari Rp100 ribu' },
  ],
  reguler: [
    { value: '<1jt', label: 'Kurang dari Rp1 juta' },
    { value: '1-5jt', label: 'Rp1–5 juta' },
    { value: '>5jt', label: 'Lebih dari Rp5 juta' },
  ],
}
