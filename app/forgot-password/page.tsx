import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/src/components/ForgotPasswordForm";

// 비밀번호 찾기 페이지. 정적 마크업은 서버 컴포넌트로 두고,
// 상호작용 폼은 ForgotPasswordForm(클라이언트)으로 분리한다.

export const metadata: Metadata = {
  title: "비밀번호 찾기 · 내 북마크",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        {/* 로고 */}
        <h1 className="mb-1 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          가입한 이메일로 재설정 링크를 보내드립니다
        </p>

        <ForgotPasswordForm />

        {/* 로그인 페이지로 이동 */}
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          비밀번호가 기억나셨나요?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
