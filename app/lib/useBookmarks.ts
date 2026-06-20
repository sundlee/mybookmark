"use client";

// 북마크 상태를 컴포넌트에 연결하는 훅.
// useSyncExternalStore 로 localStorage 외부 스토어를 구독한다.
// 서버/하이드레이션 시점에는 고정 스냅샷을 사용해 미스매치를 방지한다.

import { useSyncExternalStore } from "react";
import * as store from "./store";

export function useBookmarks() {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return {
    categories: state.categories,
    bookmarks: state.bookmarks,
    addBookmark: store.addBookmark,
    updateBookmark: store.updateBookmark,
    removeBookmark: store.removeBookmark,
    addCategory: store.addCategory,
    removeCategory: store.removeCategory,
  };
}
