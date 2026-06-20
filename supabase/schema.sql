-- 북마크 앱 DB 스키마 (Supabase SQL Editor 에서 1회 실행 — 신규 프로젝트용)
-- 로그인 사용자별 데이터 격리: 각 유저는 자신의 데이터만 접근 가능.
-- (기존 프로젝트에 user_id 를 추가하는 마이그레이션은 add-user-id.sql 참고)

-- 1) 카테고리(폴더)
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null,
  -- 데이터를 생성한 (로그인한) 유저 ID 자동 기입 + 필수
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2) 북마크
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  url         text not null,
  description text,
  image       text,
  -- 카테고리 삭제 시 해당 북마크는 '미분류'(null) 로 이동
  category_id uuid references public.categories(id) on delete set null,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists categories_user_id_idx     on public.categories(user_id);
create index if not exists bookmarks_category_id_idx   on public.bookmarks(category_id);
create index if not exists bookmarks_user_id_idx       on public.bookmarks(user_id);
create index if not exists bookmarks_created_at_idx    on public.bookmarks(created_at desc);

-- 3) RLS 활성화 + 사용자별 접근 정책 (본인 데이터만)
alter table public.categories enable row level security;
alter table public.bookmarks  enable row level security;

drop policy if exists "own rows" on public.categories;
create policy "own rows" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.bookmarks;
create policy "own rows" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
