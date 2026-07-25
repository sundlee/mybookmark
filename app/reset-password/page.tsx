import type { Metadata } from "next";
import ResetPasswordForm from "@/src/components/ResetPasswordForm";

// 비밀번호 재설정 페이지. 이메일 링크를 통해 진입한다.

export const metadata: Metadata = {
  title: "비밀번호 재설정",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface-soft p-4">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-canvas p-8 shadow-[0_1px_3px_rgba(20,20,19,0.08)]">
        {/* 로고 — 세리프 에디토리얼 헤드라인 */}
        <h1 className="font-display mb-1 text-center text-3xl text-ink">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          새 비밀번호를 입력해 주세요
        </p>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
