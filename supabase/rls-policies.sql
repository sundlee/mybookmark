-- bookmarks·categories RLS 정책 (작업별 세분화)
-- Supabase 대시보드 → SQL Editor 에서 1회 실행하세요.
-- 전제: user_id 컬럼이 이미 존재 (add-user-id.sql 적용 완료)

-- RLS 활성화 (이미 켜져 있어도 안전)
alter table public.categories enable row level security;
alter table public.bookmarks  enable row level security;

-- 기존 정책 제거 (통합 정책 등)
drop policy if exists "own rows"       on public.categories;
drop policy if exists "public access"  on public.categories;
drop policy if exists "own rows"       on public.bookmarks;
drop policy if exists "public access"  on public.bookmarks;

-- ─────────────────────────────────────────────
-- categories
-- ─────────────────────────────────────────────

-- 조회: 로그인 사용자, 본인 데이터(user_id)만
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select to authenticated
  using (auth.uid() = user_id);

-- 생성: 로그인 사용자, 자신의 ID 로만 생성 가능
drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert to authenticated
  with check (auth.uid() = user_id);

-- 수정: 본인 데이터만. with check 로 새 행도 본인 소유여야 하므로
--       user_id 를 다른 사용자로 바꿀 수 없음(= user_id 변경 불가).
drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 삭제: 본인 데이터만
drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete to authenticated
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- bookmarks
-- ─────────────────────────────────────────────

-- 조회: 로그인 사용자, 본인 데이터(user_id)만
drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks
  for select to authenticated
  using (auth.uid() = user_id);

-- 생성: 로그인 사용자, 자신의 ID 로만 생성 가능
drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks
  for insert to authenticated
  with check (auth.uid() = user_id);

-- 수정: 본인 데이터만 + user_id 변경 불가
drop policy if exists "bookmarks_update_own" on public.bookmarks;
create policy "bookmarks_update_own" on public.bookmarks
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 삭제: 본인 데이터만
drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks
  for delete to authenticated
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 확인용 (선택): 정책 목록 조회
-- select tablename, policyname, cmd
-- from pg_policies
-- where schemaname = 'public' and tablename in ('bookmarks','categories')
-- order by tablename, cmd;
-- ─────────────────────────────────────────────
