"use client";

// 북마크 앱의 최상위 클라이언트 컴포넌트.
// 사이드바 + 검색 + 카드 그리드 + 추가/수정 모달을 조합한다.

import { useEffect, useMemo, useState } from "react";
import { useBookmarks } from "@/src/lib/useBookmarks";
import { getHostname } from "@/src/lib/favicon";
import type { Bookmark } from "@/src/lib/types";
import Sidebar, { type CategoryFilter } from "./Sidebar";
import BookmarkCard from "./BookmarkCard";
import BookmarkForm, { type BookmarkFormValues } from "./BookmarkForm";

export default function BookmarkApp() {
  const {
    ready,
    error,
    categories,
    bookmarks,
    addBookmark,
    updateBookmark,
    removeBookmark,
    addCategory,
    removeCategory,
  } = useBookmarks();

  const [filter, setFilter] = useState<CategoryFilter>(null);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Bookmark | null>(null);
  // 모바일(md 미만) 사이드바 드로어 열림 여부
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 카테고리 선택 시 필터를 바꾸고, 모바일에서는 드로어를 닫는다
  const handleSelect = (f: CategoryFilter) => {
    setFilter(f);
    setSidebarOpen(false);
  };

  // 드로어가 열려 있을 때 ESC 로 닫기 (외부 키 이벤트 구독이므로 effect 사용)
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  // 현재 카테고리 필터 + 검색어로 북마크를 거른다
  const visibleBookmarks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookmarks.filter((b) => {
      if (filter === "none" && b.categoryId !== null) return false;
      if (typeof filter === "string" && filter !== "none" && b.categoryId !== filter) {
        return false;
      }
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        getHostname(b.url).toLowerCase().includes(q)
      );
    });
  }, [bookmarks, filter, query]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (bookmark: Bookmark) => {
    setEditing(bookmark);
    setFormOpen(true);
  };

  const handleSubmit = (values: BookmarkFormValues) => {
    if (editing) {
      updateBookmark(editing.id, values);
    } else {
      addBookmark(values);
    }
    setFormOpen(false);
    setEditing(null);
  };

  // 폼 추가 모드에서 미리 선택할 카테고리 (특정 카테고리를 보고 있으면 그 값)
  const defaultCategoryId =
    typeof filter === "string" && filter !== "none" ? filter : null;

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <Sidebar
        categories={categories}
        bookmarks={bookmarks}
        selected={filter}
        onSelect={handleSelect}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex flex-1 flex-col overflow-hidden bg-canvas">
        {/* 상단 바: (모바일) 햄버거 + 검색 + 추가 버튼 */}
        <header className="flex items-center gap-3 border-b border-hairline p-4">
          {/* 모바일 전용 햄버거 — 사이드바 드로어 열기 */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="shrink-0 rounded-lg p-2 text-ink transition-colors hover:bg-surface-card md:hidden"
            aria-label="메뉴 열기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목 · URL 검색"
              className="w-full rounded-lg border border-hairline bg-canvas py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {/* 시그니처 코랄 CTA */}
          <button
            type="button"
            onClick={openAdd}
            className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
          >
            + 북마크 추가
          </button>
        </header>

        {/* Supabase 오류 배너 */}
        {error && (
          <div className="border-b border-hairline bg-surface-card px-6 py-2 text-sm text-error">
            ⚠️ {error}
          </div>
        )}

        {/* 카드 그리드 (스크롤 영역) + 본문 맨 아래 푸터 */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full p-6">
            {!ready ? (
              <div className="flex min-h-[60vh] items-center justify-center text-muted">
                불러오는 중…
              </div>
            ) : visibleBookmarks.length === 0 ? (
              <EmptyState hasQuery={query.trim().length > 0} onAdd={openAdd} />
            ) : (
              // 유동 그리드: 최소 220px 열을 창 너비에 맞게 자동으로 채운다.
              // 고정 브레이크포인트와 달리 넓은 화면에서 열이 계속 늘어난다.
              <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                {visibleBookmarks.map((b) => (
                  <BookmarkCard
                    key={b.id}
                    bookmark={b}
                    category={b.categoryId ? categoryById.get(b.categoryId) : undefined}
                    onEdit={openEdit}
                    onRemove={removeBookmark}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 푸터 — 본문 콘텐츠 맨 아래에 위치해 스크롤해야 보인다 */}
          <footer className="border-t border-hairline px-6 py-4 text-center text-xs text-muted-soft">
            본 페이지는 한 입 크기로 잘라먹는 바이브코딩의 강의롤 보고 작성했습니다.
          </footer>
        </div>
      </main>

      {formOpen && (
        <BookmarkForm
          key={editing?.id ?? "new"}
          editing={editing}
          categories={categories}
          defaultCategoryId={defaultCategoryId}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function EmptyState({ hasQuery, onAdd }: { hasQuery: boolean; onAdd: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center text-muted">
      <div className="text-5xl">🔖</div>
      {hasQuery ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <>
          <p className="font-display text-lg text-ink">아직 북마크가 없습니다.</p>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
          >
            첫 북마크 추가하기
          </button>
        </>
      )}
    </div>
  );
}
