"use client";

// 카테고리(폴더) 내비게이션 사이드바.
// '전체' / '미분류' 가상 항목 + 사용자 카테고리 목록을 보여주고,
// 선택·추가·삭제를 처리한다.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Bookmark, Category } from "@/src/lib/types";
import { createClient } from "@/src/utils/supabase/client";

const supabase = createClient();

/** 선택된 필터 값: 전체(null) / 미분류("none") / 특정 카테고리 id */
export type CategoryFilter = string | null | "none";

interface SidebarProps {
  categories: Category[];
  bookmarks: Bookmark[];
  selected: CategoryFilter;
  onSelect: (filter: CategoryFilter) => void;
  onAddCategory: (name: string, color: string) => void;
  onRemoveCategory: (id: string) => void;
}

// 새 카테고리에 순환 배정할 색상 팔레트
const PALETTE = [
  "#6366f1", "#f59e0b", "#ec4899", "#10b981",
  "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6",
];

export default function Sidebar({
  categories,
  bookmarks,
  selected,
  onSelect,
  onAddCategory,
  onRemoveCategory,
}: SidebarProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // 로그아웃: Supabase 세션 종료 후 로그인 페이지로 이동
  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const countAll = bookmarks.length;
  const countNone = bookmarks.filter((b) => b.categoryId === null).length;
  const countFor = (id: string) => bookmarks.filter((b) => b.categoryId === id).length;

  const submitNew = () => {
    const name = newName.trim();
    if (!name) return;
    onAddCategory(name, PALETTE[categories.length % PALETTE.length]);
    setNewName("");
    setAdding(false);
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="mb-3 px-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
        📑 내 북마크
      </h1>

      <NavItem
        label="전체"
        count={countAll}
        active={selected === null}
        onClick={() => onSelect(null)}
      />
      <NavItem
        label="미분류"
        count={countNone}
        active={selected === "none"}
        onClick={() => onSelect("none")}
      />

      <div className="my-2 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        카테고리
      </div>

      {categories.map((c) => (
        <NavItem
          key={c.id}
          label={c.name}
          count={countFor(c.id)}
          color={c.color}
          active={selected === c.id}
          onClick={() => onSelect(c.id)}
          onRemove={() => {
            if (confirm(`'${c.name}' 카테고리를 삭제할까요?\n(북마크는 미분류로 이동합니다)`)) {
              onRemoveCategory(c.id);
              if (selected === c.id) onSelect(null);
            }
          }}
        />
      ))}

      {adding ? (
        <div className="mt-1 flex gap-1 px-1">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNew();
              if (e.key === "Escape") {
                setAdding(false);
                setNewName("");
              }
            }}
            placeholder="카테고리 이름"
            autoFocus
            className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={submitNew}
            className="rounded-md bg-indigo-600 px-2 text-sm text-white hover:bg-indigo-700"
          >
            추가
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 flex items-center gap-1 rounded-lg px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          + 카테고리 추가
        </button>
      )}

      {/* 최하단 영역 (mt-auto 로 사이드바 맨 아래 고정) */}
      <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {/* 로그아웃 버튼 */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-500 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          {loggingOut ? "로그아웃 중…" : "로그아웃"}
        </button>

        {/* 개인정보 처리방침 링크 (회색) */}
        <Link
          href="/privacy"
          className="block px-3 py-1 text-xs text-zinc-400 hover:text-zinc-600 hover:underline dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          개인정보 처리방침
        </Link>
      </div>
    </aside>
  );
}

interface NavItemProps {
  label: string;
  count: number;
  active: boolean;
  color?: string;
  onClick: () => void;
  onRemove?: () => void;
}

function NavItem({ label, count, active, color, onClick, onRemove }: NavItemProps) {
  return (
    <div
      className={`group flex items-center rounded-lg ${
        active ? "bg-indigo-100 dark:bg-indigo-950" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm"
      >
        {color && (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        )}
        <span
          className={`truncate ${
            active
              ? "font-medium text-indigo-700 dark:text-indigo-300"
              : "text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {label}
        </span>
        <span className="ml-auto text-xs text-zinc-400">{count}</span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mr-1 rounded p-1 text-zinc-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
          aria-label={`${label} 삭제`}
          title="카테고리 삭제"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
