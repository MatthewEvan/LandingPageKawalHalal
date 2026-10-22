# LandingPageKawalHalal

Landing page waitlist untuk KawalHalal, asisten AI pemberkasan sertifikasi halal UMK.

Stack: Vite + React + TypeScript + Tailwind CSS v4, Supabase (Postgres + RPC), deploy ke Vercel.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Tanpa file `.env.local`, halaman berjalan dalam **mode demo**: pendaftaran hanya disimpan di localStorage browser.

## Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (region Singapore paling dekat).
2. Buka **SQL Editor**, tempel seluruh isi [`supabase/schema.sql`](supabase/schema.sql), lalu klik **Run**.
3. Buka **Project Settings → API**, salin `Project URL` dan `anon public` key.
4. Salin `.env.example` menjadi `.env.local`, lalu isi kedua nilai tersebut.
5. Restart `npm run dev`. Banner "Mode demo" akan hilang.

### Keamanan data

- Tabel `waitlist` memakai RLS tanpa policy, jadi pengunjung tidak bisa membaca atau mengubah data secara langsung.
- Pengunjung hanya bisa memanggil 4 fungsi: `join_waitlist`, `update_waitlist_profile` (butuh token rahasia, berlaku 24 jam), `get_waitlist_stats`, dan `get_referral_count`.
- Anti-spam: honeypot, batas waktu pengisian minimum, batas 8 pendaftaran per IP per jam, dan email/WA unik.

## Melihat data untuk pitch

Jalankan di SQL Editor:

```sql
select * from insights.ringkasan;        -- total, % mau bayar, dll.
select * from insights.per_hari;         -- grafik pertumbuhan
select * from insights.per_provinsi;
select * from insights.per_peran;
select * from insights.kendala;
select * from insights.kesediaan_bayar;
select * from insights.sumber;           -- dari kanal promosi mana
select * from insights.top_referrer;
```

Schema `insights` tidak diekspos ke API publik. Export ke CSV bisa lewat **Table Editor → waitlist → Export**.

## Melacak sumber promosi

Tambahkan UTM di link yang disebar, misalnya:

```
https://domainmu.com/?utm_source=instagram&utm_campaign=pilot1
https://domainmu.com/?utm_source=wa_komunitas&utm_medium=grup_umkm_bandung
```

## Deploy ke Vercel

1. Push repo ke GitHub, lalu import di [vercel.com/new](https://vercel.com/new). Framework preset: Vite.
2. Tambahkan environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
3. Deploy.
