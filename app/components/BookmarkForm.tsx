"use client";

// 북마크 추가/수정용 모달 폼.
// URL 입력 후 포커스를 벗어나면 /api/og 를 호출해
// 제목·설명·썸네일을 자동으로 채운다(사용자가 직접 수정 가능).

import { useEffect, useRef, useState } from "react";
import type { Bookmark, Category, OgMetadata } from "../lib/types";

export interface BookmarkFormValues {
  title: string;
  url: string;
  description: string;
  image: string;
  categoryId: string | null;
}

interface BookmarkFormProps {
  editing: Bookmark | null;
  categories: Category[];
  /** 추가 모드에서 미리 선택할 카테고리 (사이드바에서 보고 있던 카테고리) */
  defaultCategoryId: string | null;
  onClose: () => void;
  onSubmit: (values: BookmarkFormValues) => void;
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
  const [description, setDescription] = useState(() => editing?.description ?? "");
  const [image, setImage] = useState(() => editing?.image ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    () => editing?.categoryId ?? defaultCategoryId,
  );

  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  // 마지막으로 OG 조회를 끝낸 URL — 중복 호출 방지
  const fetchedUrlRef = useRef<string>(editing?.url ?? "");

  // ESC 로 닫기 (외부 시스템 구독이므로 effect 사용이 적절)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /** /api/og 를 호출해 메타데이터를 가져온다 */
  const fetchMetadata = async (force = false) => {
    const value = url.trim();
    if (!value) return;
    if (!force && value === fetchedUrlRef.current) return; // 이미 조회한 URL

    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch(`/api/og?url=${encodeURIComponent(value)}`);
      const data = (await res.json()) as OgMetadata | { error: string };
      if (!res.ok || "error" in data) {
        setFetchError("error" in data ? data.error : "정보를 가져오지 못했습니다.");
        return;
      }
      fetchedUrlRef.current = value;
      // 비어 있는 필드만 자동 채움 (수동 입력값은 보존). 강제 새로고침이면 덮어쓴다.
      if (force || !title.trim()) setTitle(data.title);
      if (force || !description.trim()) setDescription(data.description);
      if (force || !image.trim()) setImage(data.image);
      if (data.url) setUrl(data.url);
    } catch {
      setFetchError("정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit({ title, url, description, image, categoryId });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
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
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => fetchMetadata(false)}
                placeholder="example.com 또는 https://example.com"
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => fetchMetadata(true)}
                disabled={!url.trim() || fetching}
                className="shrink-0 rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="페이지 정보 다시 가져오기"
              >
                {fetching ? "가져오는 중…" : "정보 가져오기"}
              </button>
            </div>
            {fetchError && <span className="text-xs text-amber-600">{fetchError}</span>}
          </label>

          {/* 썸네일 미리보기 */}
          {image && (
            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element -- 외부 OG 이미지는 일반 img 사용 */}
              <img
                src={image}
                alt="썸네일 미리보기"
                className="h-32 w-full bg-zinc-100 object-cover dark:bg-zinc-800"
                onError={() => setImage("")}
              />
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              제목
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
              설명 <span className="text-zinc-400">(선택)</span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="페이지 설명"
              rows={2}
              className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
