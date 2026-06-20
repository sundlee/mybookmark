"use client";

// 북마크 상태를 Supabase 와 연결하는 훅.
// 현재 로그인한 사용자의 데이터만 로딩하고, CRUD 는 Supabase 에 반영 후
// 로컬 상태를 갱신한다(낙관적 업데이트). 계정이 바뀌면 데이터를 다시 불러온다.
// DB 컬럼(snake_case)↔앱 타입(camelCase)은 매퍼로 변환한다.

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import type { Bookmark, Category } from "./types";

// 모듈 1회 생성 (브라우저 클라이언트는 싱글톤으로 재사용)
const supabase = createClient();

// --- DB row 타입 및 매퍼 ---
interface CategoryRow {
  id: string;
  name: string;
  color: string;
}
interface BookmarkRow {
  id: string;
  title: string;
  url: string;
  description: string | null;
  image: string | null;
  category_id: string | null;
  created_at: string;
}

function toCategory(r: CategoryRow): Category {
  return { id: r.id, name: r.name, color: r.color };
}
function toBookmark(r: BookmarkRow): Bookmark {
  return {
    id: r.id,
    title: r.title,
    url: r.url,
    description: r.description ?? undefined,
    image: r.image ?? undefined,
    categoryId: r.category_id,
    createdAt: new Date(r.created_at).getTime(),
  };
}

export interface UseBookmarks {
  /** 최초 로딩 완료 여부 */
  ready: boolean;
  /** 로딩/저장 중 발생한 오류 메시지 */
  error: string;
  categories: Category[];
  bookmarks: Bookmark[];
  addBookmark: (input: {
    title: string;
    url: string;
    description?: string;
    image?: string;
    categoryId: string | null;
  }) => Promise<void>;
  updateBookmark: (
    id: string,
    patch: { title?: string; url?: string; description?: string; image?: string; categoryId?: string | null },
  ) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  addCategory: (name: string, color: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

export function useBookmarks(): UseBookmarks {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  // 마지막으로 로딩한 사용자 ID. 동일 유저 이벤트(토큰 갱신 등)에서 중복 로딩 방지.
  // 초기값 undefined 는 "아직 한 번도 로딩 안 함"을 의미한다.
  const loadedUserIdRef = useRef<string | null | undefined>(undefined);

  // 현재 로그인한 사용자의 데이터만 로딩
  const loadFor = useCallback(async (uid: string | null) => {
    setReady(false);
    setError("");

    // 로그아웃 상태면 데이터를 비운다
    if (!uid) {
      setCategories([]);
      setBookmarks([]);
      setReady(true);
      return;
    }

    const [cats, bms] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true }),
      supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
    ]);

    // 로딩 도중 계정이 또 바뀌었으면 결과를 버린다
    if (loadedUserIdRef.current !== uid) return;

    if (cats.error || bms.error) {
      setError(cats.error?.message ?? bms.error?.message ?? "데이터를 불러오지 못했습니다.");
    } else {
      setCategories((cats.data as CategoryRow[]).map(toCategory));
      setBookmarks((bms.data as BookmarkRow[]).map(toBookmark));
    }
    setReady(true);
  }, []);

  // 마운트 시 + 계정 변경 시 데이터 로딩.
  // onAuthStateChange 는 구독 직후 INITIAL_SESSION 이벤트로 현재 세션을 즉시 전달한다.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      // 사용자 ID 가 실제로 바뀐 경우(또는 최초)에만 재로딩
      if (uid !== loadedUserIdRef.current) {
        loadedUserIdRef.current = uid;
        loadFor(uid);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadFor]);

  const addBookmark = useCallback<UseBookmarks["addBookmark"]>(async (input) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        title: input.title.trim(),
        url: input.url.trim(),
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        category_id: input.categoryId,
      })
      .select()
      .single();
    if (error) return setError(error.message);
    setBookmarks((prev) => [toBookmark(data as BookmarkRow), ...prev]);
  }, []);

  const updateBookmark = useCallback<UseBookmarks["updateBookmark"]>(async (id, patch) => {
    // 앱 필드 → DB 컬럼 변환 (정의된 값만 전송)
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title.trim();
    if (patch.url !== undefined) row.url = patch.url.trim();
    if (patch.description !== undefined) row.description = patch.description.trim() || null;
    if (patch.image !== undefined) row.image = patch.image.trim() || null;
    if (patch.categoryId !== undefined) row.category_id = patch.categoryId;

    const { data, error } = await supabase
      .from("bookmarks")
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error) return setError(error.message);
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? toBookmark(data as BookmarkRow) : b)),
    );
  }, []);

  const removeBookmark = useCallback<UseBookmarks["removeBookmark"]>(async (id) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) return setError(error.message);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addCategory = useCallback<UseBookmarks["addCategory"]>(async (name, color) => {
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), color })
      .select()
      .single();
    if (error) return setError(error.message);
    setCategories((prev) => [...prev, toCategory(data as CategoryRow)]);
  }, []);

  const removeCategory = useCallback<UseBookmarks["removeCategory"]>(async (id) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return setError(error.message);
    // DB FK(on delete set null)로 해당 북마크의 category_id 가 null 이 되므로 로컬도 맞춰준다
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBookmarks((prev) =>
      prev.map((b) => (b.categoryId === id ? { ...b, categoryId: null } : b)),
    );
  }, []);

  return {
    ready,
    error,
    categories,
    bookmarks,
    addBookmark,
    updateBookmark,
    removeBookmark,
    addCategory,
    removeCategory,
  };
}
