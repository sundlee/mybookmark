import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/src/components/LoginForm";

// 로그인 페이지. 정적 마크업(로고·링크)은 서버 컴포넌트로 두고,
// 상호작용이 필요한 폼은 LoginForm(클라이언트)으로 분리한다.

export const metadata: Metadata = {
  title: "로그인 · 내 북마크",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        {/* 로고 */}
        <h1 className="mb-1 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          로그인하고 북마크를 관리하세요
        </p>

        <LoginForm />

        {/* 비밀번호 찾기 페이지로 이동 */}
        <p className="mt-4 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-zinc-500 hover:text-indigo-600 hover:underline dark:text-zinc-400 dark:hover:text-indigo-400"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </p>

        {/* 회원가입 페이지로 이동 */}
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
