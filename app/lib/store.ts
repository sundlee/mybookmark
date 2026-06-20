// localStorage 를 외부 스토어로 다루는 모듈 레벨 상태 저장소.
// useSyncExternalStore 와 함께 쓰면 하이드레이션 미스매치 없이
// 클라이언트 전용 데이터를 안전하게 구독할 수 있다.

import type { Bookmark, BookmarkState, Category } from "./types";
import { createId, createInitialState, loadState, saveState } from "./storage";

// 서버 렌더 및 하이드레이션 시점에 사용하는 고정 스냅샷.
// 참조가 변하지 않아야 useSyncExternalStore 가 안정적으로 동작한다.
const SERVER_SNAPSHOT: BookmarkState = createInitialState();

let state: BookmarkState | null = null;
const listeners = new Set<() => void>();

/** 최초 접근 시 localStorage 에서 1회 로딩 */
function ensureLoaded(): BookmarkState {
  if (state === null) {
    state = loadState();
  }
  return state;
}

function emit(): void {
  for (const l of listeners) l();
}

/** 상태를 교체하고 저장 + 구독자에게 알림 */
function setState(next: BookmarkState): void {
  state = next;
  saveState(next);
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 클라이언트 스냅샷 (안정적 참조 유지) */
export function getSnapshot(): BookmarkState {
  return ensureLoaded();
}

/** 서버 스냅샷 — 항상 동일한 참조 반환 */
export function getServerSnapshot(): BookmarkState {
  return SERVER_SNAPSHOT;
}

// --- 변경 액션들 ---

export function addBookmark(input: {
  title: string;
  url: string;
  categoryId: string | null;
}): void {
  const prev = ensureLoaded();
  setState({
    ...prev,
    bookmarks: [
      {
        id: createId(),
        title: input.title.trim(),
        url: input.url.trim(),
        categoryId: input.categoryId,
        createdAt: Date.now(),
      },
      ...prev.bookmarks,
    ],
  });
}

export function updateBookmark(
  id: string,
  patch: Partial<Omit<Bookmark, "id" | "createdAt">>,
): void {
  const prev = ensureLoaded();
  setState({
    ...prev,
    bookmarks: prev.bookmarks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  });
}

export function removeBookmark(id: string): void {
  const prev = ensureLoaded();
  setState({
    ...prev,
    bookmarks: prev.bookmarks.filter((b) => b.id !== id),
  });
}

export function addCategory(name: string, color: string): Category {
  const prev = ensureLoaded();
  const category: Category = { id: createId(), name: name.trim(), color };
  setState({ ...prev, categories: [...prev.categories, category] });
  return category;
}

export function removeCategory(id: string): void {
  const prev = ensureLoaded();
  // 카테고리 삭제 시 해당 북마크는 '미분류'로 이동
  setState({
    categories: prev.categories.filter((c) => c.id !== id),
    bookmarks: prev.bookmarks.map((b) =>
      b.categoryId === id ? { ...b, categoryId: null } : b,
    ),
  });
}
