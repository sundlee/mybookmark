"use client";

// 개별 북마크를 카드 형태로 표시한다.
// OG 썸네일 → 제목 → 설명 → (파비콘+도메인) → 카테고리 배지 순으로 보여주고,
// 클릭하면 새 탭으로 이동한다.

import { useState } from "react";
import type { Bookmark, Category } from "@/src/lib/types";
import { getHostname, normalizeUrl } from "@/src/lib/favicon";
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
  // 이미지 로딩 실패 시 썸네일 영역을 숨긴다
  const [imageOk, setImageOk] = useState(Boolean(bookmark.image));
  const host = getHostname(bookmark.url);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <a
        href={normalizeUrl(bookmark.url)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 flex-col"
      >
        {/* OG 썸네일 — 항상 같은 높이를 차지해 카드 높이를 균일하게 유지.
            이미지가 없거나 로딩 실패 시 파비콘 플레이스홀더로 대체한다. */}
        <div className="relative h-36 w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {bookmark.image && imageOk ? (
            // eslint-disable-next-line @next/next/no-img-element -- 외부 OG 이미지는 일반 img 사용
            <img
              src={bookmark.image}
              alt=""
              loading="lazy"
              onError={() => setImageOk(false)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
              <Favicon url={bookmark.url} size={36} />
              <span className="max-w-[80%] truncate text-xs text-zinc-400">{host}</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
          {/* 파비콘 + 도메인 */}
          <div className="flex items-center gap-2">
            <Favicon url={bookmark.url} size={20} />
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {host}
            </span>
          </div>

          <h3 className="line-clamp-2 font-medium leading-snug text-zinc-900 dark:text-zinc-50">
            {bookmark.title || host}
          </h3>

          {bookmark.description && (
            <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
              {bookmark.description}
            </p>
          )}

          {category && (
            <span
              className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
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
          className="rounded-md bg-white/90 p-1.5 text-zinc-500 shadow-sm hover:text-zinc-800 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:text-zinc-50"
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
          className="rounded-md bg-white/90 p-1.5 text-zinc-500 shadow-sm hover:text-red-600 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:text-red-500"
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
