import type { Metadata } from "next";
import ResetPasswordForm from "@/src/components/ResetPasswordForm";

// 비밀번호 재설정 페이지. 이메일 링크를 통해 진입한다.

export const metadata: Metadata = {
  title: "비밀번호 재설정",
};

export default function ResetPasswordPage() {
  return (
    <div className="pastel-mesh flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-canvas p-8 shadow-[0_0_32px_0_rgba(0,0,0,0.1)]">
        {/* 로고 */}
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-primary">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-ink-mute">
          새 비밀번호를 입력해 주세요
        </p>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
