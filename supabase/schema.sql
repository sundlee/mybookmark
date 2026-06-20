-- 북마크 앱 DB 스키마 (Supabase SQL Editor 에서 1회 실행)
-- 로그인 없는 공용(public) 테이블 구성: anon 키로 읽기/쓰기 허용.
-- ⚠️ publishable 키를 아는 누구나 접근 가능하므로 개인용 프로젝트에만 사용하세요.

-- 1) 카테고리(폴더)
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null,
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
  created_at  timestamptz not null default now()
);

create index if not exists bookmarks_category_id_idx on public.bookmarks(category_id);
create index if not exists bookmarks_created_at_idx on public.bookmarks(created_at desc);

-- 3) RLS 활성화 + 공용 접근 정책 (로그인 없는 anon 전체 허용)
alter table public.categories enable row level security;
alter table public.bookmarks  enable row level security;

drop policy if exists "public access" on public.categories;
create policy "public access" on public.categories
  for all using (true) with check (true);

drop policy if exists "public access" on public.bookmarks;
create policy "public access" on public.bookmarks
  for all using (true) with check (true);

-- 4) 기본 카테고리 시드 (테이블이 비어 있을 때만)
insert into public.categories (name, color)
select * from (values
  ('개발', '#6366f1'),
  ('뉴스', '#f59e0b'),
  ('엔터테인먼트', '#ec4899')
) as seed(name, color)
where not exists (select 1 from public.categories);
