-- bookmarks·categories 에 user_id 추가 마이그레이션
-- Supabase 대시보드 → SQL Editor 에서 1회 실행하세요.
-- ⚠️ 아래 1단계에서 기존 데이터를 모두 삭제합니다 (요청 사항).

-- ──────────────────────────────────────────────
-- 1) 기존 데이터 전체 삭제
--    (bookmarks 가 categories 를 참조하므로 bookmarks 를 먼저 삭제)
-- ──────────────────────────────────────────────
delete from public.bookmarks;
delete from public.categories;

-- ──────────────────────────────────────────────
-- 2) user_id 컬럼 추가
--    - default auth.uid() : 데이터를 생성한 (로그인한) 유저의 ID 자동 기입
--    - not null            : 필수 컬럼
--    - auth.users 참조      : 유저 삭제 시 해당 데이터도 함께 삭제(cascade)
-- ──────────────────────────────────────────────
alter table public.categories
  add column user_id uuid not null default auth.uid()
  references auth.users(id) on delete cascade;

alter table public.bookmarks
  add column user_id uuid not null default auth.uid()
  references auth.users(id) on delete cascade;

create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists bookmarks_user_id_idx  on public.bookmarks(user_id);

-- ──────────────────────────────────────────────
-- 3) (권장) 사용자별 데이터 격리 RLS
--    기존 "public access"(모두 허용) 정책을 본인 데이터만 접근하도록 교체.
--    ※ 이 단계를 생략하면 user_id 는 기록되지만 다른 유저의 데이터도
--      여전히 조회/수정됩니다. 유저별 분리를 원하면 함께 실행하세요.
-- ──────────────────────────────────────────────
drop policy if exists "public access" on public.categories;
create policy "own rows" on public.categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "public access" on public.bookmarks;
create policy "own rows" on public.bookmarks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 확인용 쿼리 (선택): 컬럼이 추가됐는지 확인
-- select column_name, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public' and table_name in ('bookmarks','categories')
--   and column_name = 'user_id';
-- ──────────────────────────────────────────────
