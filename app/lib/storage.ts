// localStorage 기반 영속화 계층.
// 브라우저 전용 API 이므로 항상 typeof window 가드를 거친다.

import type { BookmarkState, Category } from "./types";

const STORAGE_KEY = "mybookmark.state.v1";

/** 충돌 가능성이 낮은 간단한 id 생성기 (crypto.randomUUID 우선) */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 최초 실행 시 보여줄 기본 카테고리 */
const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-dev", name: "개발", color: "#6366f1" },
  { id: "cat-news", name: "뉴스", color: "#f59e0b" },
  { id: "cat-fun", name: "엔터테인먼트", color: "#ec4899" },
];

/** 빈 상태에서 시작할 때 사용할 초기 상태 */
export function createInitialState(): BookmarkState {
  return { categories: DEFAULT_CATEGORIES, bookmarks: [] };
}

/** localStorage 에서 상태를 읽어온다. 없거나 손상되면 초기 상태 반환 */
export function loadState(): BookmarkState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<BookmarkState>;
    // 최소한의 형태 검증
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.bookmarks)) {
      return createInitialState();
    }
    return {
      categories: parsed.categories,
      bookmarks: parsed.bookmarks,
    };
  } catch {
    return createInitialState();
  }
}

/** 상태를 localStorage 에 저장한다 */
export function saveState(state: BookmarkState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 용량 초과 등은 조용히 무시 (앱 동작은 유지)
  }
}
