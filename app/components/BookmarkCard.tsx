"use client";

// 개별 북마크를 카드 형태로 표시한다. 클릭하면 새 탭으로 이동.

import type { Bookmark, Category } from "../lib/types";
import { getHostname, normalizeUrl } from "../lib/favicon";
import Favicon from "./Favicon";

interface BookmarkCardProps {
  bookmark: Bookmark;
  category: Category | undefined;
  onEdit: (bookmark: Bookmark) => void;
  onRemove: (id: string) => void;
}

export default function BookmarkCard({
  bookmark,
  category,
  onEdit,
  onRemove,
}: BookmarkCardProps) {
  return (
    <div className="group relative flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <a
        href={normalizeUrl(bookmark.url)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-start gap-3"
      >
        <Favicon url={bookmark.url} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-zinc-900 dark:text-zinc-50">
            {bookmark.title || getHostname(bookmark.url)}
          </h3>
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {getHostname(bookmark.url)}
          </p>
          {category && (
            <span
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${category.color}1a`, color: category.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>
          )}
        </div>
      </a>

      {/* 호버 시 나타나는 수정/삭제 버튼 */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(bookmark)}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="수정"
          title="수정"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onRemove(bookmark.id)}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          aria-label="삭제"
          title="삭제"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
