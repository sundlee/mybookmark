import type { Metadata } from "next";
import ResetPasswordForm from "@/src/components/ResetPasswordForm";

// 비밀번호 재설정 페이지. 이메일 링크를 통해 진입한다.

export const metadata: Metadata = {
  title: "비밀번호 재설정",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        {/* 로고 */}
        <h1 className="mb-1 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          새 비밀번호를 입력해 주세요
        </p>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
