"use client";

// 북마크 앱의 최상위 클라이언트 컴포넌트.
// 사이드바 + 검색 + 카드 그리드 + 추가/수정 모달을 조합한다.

import { useMemo, useState } from "react";
import { useBookmarks } from "../lib/useBookmarks";
import { getHostname } from "../lib/favicon";
import type { Bookmark } from "../lib/types";
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
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        categories={categories}
        bookmarks={bookmarks}
        selected={filter}
        onSelect={setFilter}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* 상단 바: 검색 + 추가 버튼 */}
        <header className="flex items-center gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
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
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + 북마크 추가
          </button>
        </header>

        {/* Supabase 오류 배너 */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* 카드 그리드 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!ready ? (
            <div className="flex h-full items-center justify-center text-zinc-400">
              불러오는 중…
            </div>
          ) : visibleBookmarks.length === 0 ? (
            <EmptyState hasQuery={query.trim().length > 0} onAdd={openAdd} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-zinc-400">
      <div className="text-5xl">🔖</div>
      {hasQuery ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <>
          <p>아직 북마크가 없습니다.</p>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            첫 북마크 추가하기
          </button>
        </>
      )}
    </div>
  );
}
