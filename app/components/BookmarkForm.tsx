"use client";

// 북마크 추가/수정용 모달 폼.
// 부모에서 열릴 때만 마운트하고 key 로 재생성하므로,
// 초기값은 useState 지연 초기화로 props 에서 한 번만 읽는다(effect 동기화 불필요).

import { useEffect, useState } from "react";
import type { Bookmark, Category } from "../lib/types";

interface BookmarkFormProps {
  editing: Bookmark | null;
  categories: Category[];
  /** 추가 모드에서 미리 선택할 카테고리 (사이드바에서 보고 있던 카테고리) */
  defaultCategoryId: string | null;
  onClose: () => void;
  onSubmit: (values: { title: string; url: string; categoryId: string | null }) => void;
}

export default function BookmarkForm({
  editing,
  categories,
  defaultCategoryId,
  onClose,
  onSubmit,
}: BookmarkFormProps) {
  const [title, setTitle] = useState(() => editing?.title ?? "");
  const [url, setUrl] = useState(() => editing?.url ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    () => editing?.categoryId ?? defaultCategoryId,
  );

  // ESC 로 닫기 (외부 시스템 구독이므로 effect 사용이 적절)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit({ title, url, categoryId });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {editing ? "북마크 수정" : "북마크 추가"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com 또는 https://example.com"
              autoFocus
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              제목 <span className="text-zinc-400">(선택)</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="비워 두면 도메인이 표시됩니다"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              카테고리
            </span>
            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">미분류</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              disabled={!url.trim()}
            >
              {editing ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
