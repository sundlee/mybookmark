"use client";

// 북마크 추가/수정용 모달 폼.
// URL 입력 후 포커스를 벗어나면 /api/og 를 호출해
// 제목·설명·썸네일을 자동으로 채운다(사용자가 직접 수정 가능).

import { useEffect, useRef, useState } from "react";
import type { Bookmark, Category, OgMetadata } from "@/src/lib/types";

export interface BookmarkFormValues {
  title: string;
  url: string;
  description: string;
  image: string;
  categoryId: string | null;
}

// 공통 텍스트 입력 스타일 — hairline 보더 + 포커스 시 코랄 링
const inputClass =
  "rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "text-sm font-medium text-ink";

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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-hairline bg-canvas p-6 shadow-[0_1px_3px_rgba(20,20,19,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display mb-5 text-2xl text-ink">
          {editing ? "북마크 수정" : "북마크 추가"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>URL</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => fetchMetadata(false)}
                placeholder="example.com 또는 https://example.com"
                autoFocus
                className={`min-w-0 flex-1 ${inputClass}`}
              />
              {/* 보조 액션 — 크림 secondary 버튼 (hairline 아웃라인) */}
              <button
                type="button"
                onClick={() => fetchMetadata(true)}
                disabled={!url.trim() || fetching}
                className="shrink-0 rounded-lg border border-hairline bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-card disabled:opacity-50"
                title="페이지 정보 다시 가져오기"
              >
                {fetching ? "가져오는 중…" : "정보 가져오기"}
              </button>
            </div>
            {fetchError && <span className="text-xs text-error">{fetchError}</span>}
          </label>

          {/* 썸네일 미리보기 */}
          {image && (
            <div className="overflow-hidden rounded-lg border border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element -- 외부 OG 이미지는 일반 img 사용 */}
              <img
                src={image}
                alt="썸네일 미리보기"
                className="h-32 w-full bg-surface-card object-cover"
                onError={() => setImage("")}
              />
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>제목</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="비워 두면 도메인이 표시됩니다"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>
              설명 <span className="font-normal text-muted">(선택)</span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="페이지 설명"
              rows={2}
              className={`resize-none ${inputClass}`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>카테고리</span>
            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className={inputClass}
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
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-card hover:text-ink"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:bg-primary-disabled disabled:text-muted"
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
