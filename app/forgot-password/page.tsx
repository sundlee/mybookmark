import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/src/components/ForgotPasswordForm";

// 비밀번호 찾기 페이지. 정적 마크업은 서버 컴포넌트로 두고,
// 상호작용 폼은 ForgotPasswordForm(클라이언트)으로 분리한다.

export const metadata: Metadata = {
  title: "비밀번호 찾기",
};

export default function ForgotPasswordPage() {
  return (
    <div className="pastel-mesh flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-canvas p-8 shadow-[0_0_32px_0_rgba(0,0,0,0.1)]">
        {/* 로고 */}
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-primary">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-ink-mute">
          가입한 이메일로 재설정 링크를 보내드립니다
        </p>

        <ForgotPasswordForm />

        {/* 로그인 페이지로 이동 */}
        <p className="mt-6 text-center text-sm text-ink-mute">
          비밀번호가 기억나셨나요?{" "}
          <Link
            href="/login"
            className="font-bold text-link hover:text-link-hover hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
