import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "@/src/components/SignupForm";

// 회원가입 페이지. 정적 마크업(로고·링크)은 서버 컴포넌트로 두고,
// 상호작용이 필요한 폼은 SignupForm(클라이언트)으로 분리한다.

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        {/* 로고 */}
        <h1 className="mb-1 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          계정을 만들고 시작하세요
        </p>

        <SignupForm />

        {/* 로그인 페이지로 이동 */}
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400"
          >
            로그인
          </Link>
        </p>

        {/* 개인정보 처리방침 링크 (회색) */}
        <p className="mt-4 text-center text-xs">
          <Link
            href="/privacy"
            className="text-zinc-400 hover:text-zinc-600 hover:underline dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            개인정보 처리방침
          </Link>
        </p>
      </div>
    </div>
  );
}
