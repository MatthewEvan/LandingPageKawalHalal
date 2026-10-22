-- KawalHalal waitlist schema
-- Jalankan sekali di Supabase Dashboard -> SQL Editor.
--
-- Prinsip keamanan: tabel tidak bisa dibaca/ditulis langsung oleh pengunjung.
-- Semua akses publik lewat fungsi RPC (security definer) di bawah.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Tabel utama
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  nama             text not null check (char_length(nama) between 2 and 100),
  email            text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  whatsapp         text check (whatsapp is null or whatsapp ~ '^62[0-9]{8,13}$'),
  peran            text not null,
  provinsi         text not null check (char_length(provinsi) between 3 and 60),

  -- Diisi di langkah kedua (opsional)
  kota             text check (kota is null or char_length(kota) <= 80),
  jenis_usaha      text check (jenis_usaha is null or char_length(jenis_usaha) <= 60),
  status_halal     text check (status_halal is null or status_halal in ('belum', 'proses', 'sudah')),
  kanal            text check (kanal is null or kanal in ('telegram', 'whatsapp', 'keduanya')),
  kendala          text[] not null default '{}',
  kesediaan_bayar  text,
  catatan          text check (catatan is null or char_length(catatan) <= 500),

  referral_code    text not null unique,
  referred_by      text,
  edit_token       uuid not null default gen_random_uuid(),

  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  ip_hash          text,
  consent          boolean not null check (consent),

  constraint kontak_wajib check (email is not null or whatsapp is not null)
);

-- Aturan nilai peran dan kesediaan bayar dipasang terpisah supaya file ini bisa
-- dijalankan ulang di database yang sudah ada (memperbarui aturan lama).
-- Segmen pendaftar: UMK atau usaha reguler (dua tahap pendaftaran SiHalal).
alter table public.waitlist drop constraint if exists waitlist_peran_check;
alter table public.waitlist add constraint waitlist_peran_check
  check (peran in ('umk', 'reguler')) not valid;

-- UMK: 25rb, 50rb, 50-100rb, >100rb. Reguler: <1jt, 1-5jt, >5jt.
alter table public.waitlist drop constraint if exists waitlist_kesediaan_bayar_check;
alter table public.waitlist add constraint waitlist_kesediaan_bayar_check
  check (kesediaan_bayar is null or kesediaan_bayar in ('25rb', '50rb', '50-100rb', '>100rb', '<1jt', '1-5jt', '>5jt')) not valid;

create unique index if not exists waitlist_email_uniq on public.waitlist (lower(email)) where email is not null;
create unique index if not exists waitlist_whatsapp_uniq on public.waitlist (whatsapp) where whatsapp is not null;
create index if not exists waitlist_created_at_idx on public.waitlist (created_at);
create index if not exists waitlist_referred_by_idx on public.waitlist (referred_by);
create index if not exists waitlist_ip_hash_idx on public.waitlist (ip_hash, created_at);

alter table public.waitlist enable row level security;
-- Tanpa policy = anon & authenticated tidak bisa select/insert/update/delete langsung.
revoke all on public.waitlist from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helper
-- ---------------------------------------------------------------------------
create or replace function public._waitlist_new_code()
returns text
language plpgsql
set search_path = public, extensions
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.waitlist w where w.referral_code = code);
  end loop;
  return code;
end;
$$;

create or replace function public._waitlist_ip_hash()
returns text
language plpgsql
stable
set search_path = public, extensions
as $$
declare
  headers json;
  ip text;
begin
  headers := nullif(current_setting('request.headers', true), '')::json;
  ip := coalesce(
    split_part(headers ->> 'x-forwarded-for', ',', 1),
    headers ->> 'cf-connecting-ip',
    headers ->> 'x-real-ip'
  );
  if ip is null or ip = '' then
    return null;
  end if;
  return encode(extensions.digest('kawalhalal:' || trim(ip), 'sha256'), 'hex');
exception when others then
  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: daftar waitlist (langkah 1)
-- ---------------------------------------------------------------------------
create or replace function public.join_waitlist(
  p_nama          text,
  p_email         text,
  p_whatsapp      text,
  p_peran         text,
  p_provinsi      text,
  p_referred_by   text default null,
  p_utm_source    text default null,
  p_utm_medium    text default null,
  p_utm_campaign  text default null,
  p_consent       boolean default false
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email    text := nullif(lower(trim(p_email)), '');
  v_wa       text := nullif(regexp_replace(coalesce(p_whatsapp, ''), '[^0-9]', '', 'g'), '');
  v_ref      text := nullif(upper(trim(p_referred_by)), '');
  v_ip       text := public._waitlist_ip_hash();
  v_existing public.waitlist;
  v_row      public.waitlist;
  v_position bigint;
begin
  if v_wa is not null and v_wa like '0%' then
    v_wa := '62' || substr(v_wa, 2);
  end if;

  if not coalesce(p_consent, false) then
    raise exception 'consent_required' using errcode = 'P0001';
  end if;

  -- Batas sederhana: maksimal 8 pendaftaran per IP per jam, 60 per menit secara global
  if v_ip is not null and (
    select count(*) from public.waitlist w
    where w.ip_hash = v_ip and w.created_at > now() - interval '1 hour'
  ) >= 8 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if (select count(*) from public.waitlist w where w.created_at > now() - interval '1 minute') >= 60 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  -- Sudah terdaftar? kembalikan data antrean tanpa edit token
  select * into v_existing from public.waitlist w
  where (v_email is not null and lower(w.email) = v_email)
     or (v_wa is not null and w.whatsapp = v_wa)
  limit 1;

  if found then
    select count(*) into v_position from public.waitlist w where w.created_at <= v_existing.created_at;
    return json_build_object(
      'already_registered', true,
      'referral_code', v_existing.referral_code,
      'position', v_position,
      'edit_token', null
    );
  end if;

  if v_ref is not null and not exists (select 1 from public.waitlist w where w.referral_code = v_ref) then
    v_ref := null;
  end if;

  insert into public.waitlist (
    nama, email, whatsapp, peran, provinsi, referral_code, referred_by,
    utm_source, utm_medium, utm_campaign, ip_hash, consent
  ) values (
    trim(p_nama), v_email, v_wa, p_peran, trim(p_provinsi), public._waitlist_new_code(), v_ref,
    left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 100), v_ip, true
  )
  returning * into v_row;

  select count(*) into v_position from public.waitlist w where w.created_at <= v_row.created_at;

  return json_build_object(
    'already_registered', false,
    'referral_code', v_row.referral_code,
    'position', v_position,
    'edit_token', v_row.edit_token
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: lengkapi profil (langkah 2, opsional). Hanya bisa dalam 24 jam pakai edit_token.
-- ---------------------------------------------------------------------------
create or replace function public.update_waitlist_profile(
  p_edit_token      uuid,
  p_kota            text default null,
  p_jenis_usaha     text default null,
  p_status_halal    text default null,
  p_kanal           text default null,
  p_kendala         text[] default '{}',
  p_kesediaan_bayar text default null,
  p_catatan         text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.waitlist w set
    kota            = nullif(trim(p_kota), ''),
    jenis_usaha     = nullif(trim(p_jenis_usaha), ''),
    status_halal    = nullif(p_status_halal, ''),
    kanal           = nullif(p_kanal, ''),
    kendala         = coalesce(p_kendala[1:10], '{}'),
    kesediaan_bayar = nullif(p_kesediaan_bayar, ''),
    catatan         = nullif(trim(p_catatan), ''),
    updated_at      = now()
  where w.edit_token = p_edit_token
    and w.created_at > now() - interval '24 hours';
  return found;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: statistik publik untuk counter di halaman
-- ---------------------------------------------------------------------------
create or replace function public.get_waitlist_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'total',      count(*),
    'umk',        count(*) filter (where peran = 'umk'),
    'reguler',    count(*) filter (where peran = 'reguler'),
    'provinsi',   count(distinct provinsi)
  )
  from public.waitlist;
$$;

-- ---------------------------------------------------------------------------
-- RPC: jumlah teman yang diajak lewat kode referral
-- ---------------------------------------------------------------------------
create or replace function public.get_referral_count(p_code text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.waitlist where referred_by = upper(trim(p_code));
$$;

revoke all on function public._waitlist_new_code() from public, anon, authenticated;
revoke all on function public._waitlist_ip_hash() from public, anon, authenticated;
grant execute on function public.join_waitlist(text, text, text, text, text, text, text, text, text, boolean) to anon, authenticated;
grant execute on function public.update_waitlist_profile(uuid, text, text, text, text, text[], text, text) to anon, authenticated;
grant execute on function public.get_waitlist_stats() to anon, authenticated;
grant execute on function public.get_referral_count(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Rekap untuk tim (schema terpisah, TIDAK diekspos ke API publik).
-- Buka lewat SQL Editor: select * from insights.ringkasan;
-- ---------------------------------------------------------------------------
create schema if not exists insights;
revoke all on schema insights from public, anon, authenticated;

drop view if exists insights.ringkasan;
create view insights.ringkasan as
select
  count(*)                                              as total_pendaftar,
  count(*) filter (where peran = 'umk')                 as usaha_umk,
  count(*) filter (where peran = 'reguler')             as usaha_reguler,
  count(distinct provinsi)                              as jumlah_provinsi,
  count(*) filter (where referred_by is not null)       as dari_referral,
  count(*) filter (where kesediaan_bayar is not null)   as menjawab_biaya
from public.waitlist;

create or replace view insights.per_hari as
select tanggal, pendaftar, sum(pendaftar) over (order by tanggal) as kumulatif
from (
  select (created_at at time zone 'Asia/Jakarta')::date as tanggal, count(*) as pendaftar
  from public.waitlist group by 1
) harian
order by tanggal;

create or replace view insights.per_provinsi as
select provinsi, count(*) as pendaftar from public.waitlist group by 1 order by 2 desc;

create or replace view insights.per_peran as
select peran, count(*) as pendaftar from public.waitlist group by 1 order by 2 desc;

create or replace view insights.kanal as
select coalesce(kanal, '(tidak diisi)') as kanal, count(*) as pendaftar from public.waitlist group by 1 order by 2 desc;

create or replace view insights.kendala as
select k as kendala, count(*) as pendaftar
from public.waitlist, unnest(kendala) as k group by 1 order by 2 desc;

drop view if exists insights.kesediaan_bayar;
create view insights.kesediaan_bayar as
select peran as segmen, coalesce(kesediaan_bayar, '(tidak diisi)') as kesediaan_bayar, count(*) as pendaftar
from public.waitlist group by 1, 2 order by 1, 3 desc;

create or replace view insights.status_halal as
select coalesce(status_halal, '(tidak diisi)') as status_halal, count(*) as pendaftar
from public.waitlist group by 1 order by 2 desc;

create or replace view insights.sumber as
select coalesce(utm_source, '(langsung)') as sumber, count(*) as pendaftar
from public.waitlist group by 1 order by 2 desc;

create or replace view insights.top_referrer as
select r.nama, r.referral_code, count(*) as teman_diajak
from public.waitlist w join public.waitlist r on r.referral_code = w.referred_by
group by 1, 2 order by 3 desc limit 50;
