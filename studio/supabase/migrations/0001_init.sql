-- Sedarikini Studio — skema awal
-- Jalankan di Supabase Dashboard → SQL Editor → New query → paste → Run.

create extension if not exists pgcrypto;

/* ------------------------------------------------------------------ */
/* Profil + pengaturan suara                                           */
/* ------------------------------------------------------------------ */

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  voice_id text,
  voice_model text default 'eleven_multilingual_v2',
  voice_settings jsonb not null default
    '{"stability":0.5,"similarity_boost":0.75,"style":0.25,"use_speaker_boost":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

/* ------------------------------------------------------------------ */
/* Asset (footage, VO, hasil render, thumbnail)                        */
/* ------------------------------------------------------------------ */

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('footage', 'audio', 'render', 'thumbnail')),
  name text not null,
  bucket text not null,
  path text not null,
  thumb_path text,
  size bigint,
  duration numeric,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create index if not exists assets_owner_kind_idx
  on public.assets (owner_id, kind, created_at desc);

/* ------------------------------------------------------------------ */
/* Video                                                               */
/* ------------------------------------------------------------------ */

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Video baru',
  status text not null default 'draf'
    check (status in ('draf', 'siap', 'render', 'selesai')),
  script text not null default '',
  scenes jsonb not null default '[]'::jsonb,
  tail numeric not null default 2.6,
  vo_asset_id uuid references public.assets(id) on delete set null,
  voice_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_owner_idx
  on public.videos (owner_id, updated_at desc);

/* ------------------------------------------------------------------ */
/* Antrean render                                                      */
/* ------------------------------------------------------------------ */

create table if not exists public.render_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  status text not null default 'antre'
    check (status in ('antre', 'dikerjakan', 'selesai', 'gagal')),
  progress integer not null default 0 check (progress between 0 and 100),
  log text not null default '',
  result_asset_id uuid references public.assets(id) on delete set null,
  error text,
  worker text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists render_jobs_antre_idx
  on public.render_jobs (created_at) where status = 'antre';
create index if not exists render_jobs_owner_idx
  on public.render_jobs (owner_id, created_at desc);
create index if not exists render_jobs_video_idx
  on public.render_jobs (video_id, created_at desc);

/* ------------------------------------------------------------------ */
/* Trigger updated_at + profil otomatis                                */
/* ------------------------------------------------------------------ */

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* Pengguna yang sudah ada sebelum migrasi. */
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

/* ------------------------------------------------------------------ */
/* RLS                                                                 */
/* ------------------------------------------------------------------ */

alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.videos enable row level security;
alter table public.render_jobs enable row level security;

drop policy if exists "profil sendiri" on public.profiles;
create policy "profil sendiri" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "aset sendiri" on public.assets;
create policy "aset sendiri" on public.assets
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "video sendiri" on public.videos;
create policy "video sendiri" on public.videos
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "job sendiri" on public.render_jobs;
create policy "job sendiri" on public.render_jobs
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

/* ------------------------------------------------------------------ */
/* Storage — semua bucket privat, diakses lewat signed URL             */
/* ------------------------------------------------------------------ */

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('footage', 'footage', false, 2147483648),
  ('audio', 'audio', false, 104857600),
  ('renders', 'renders', false, 2147483648),
  ('thumbnails', 'thumbnails', false, 52428800)
on conflict (id) do nothing;

drop policy if exists "storage baca sendiri" on storage.objects;
create policy "storage baca sendiri" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('footage', 'audio', 'renders', 'thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "storage unggah sendiri" on storage.objects;
create policy "storage unggah sendiri" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('footage', 'audio', 'renders', 'thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "storage ubah sendiri" on storage.objects;
create policy "storage ubah sendiri" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('footage', 'audio', 'renders', 'thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('footage', 'audio', 'renders', 'thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "storage hapus sendiri" on storage.objects;
create policy "storage hapus sendiri" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('footage', 'audio', 'renders', 'thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
