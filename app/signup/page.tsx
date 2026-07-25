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
    <div className="pastel-mesh flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-canvas p-8 shadow-[0_0_32px_0_rgba(0,0,0,0.1)]">
        {/* 로고 */}
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-primary">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-ink-mute">
          계정을 만들고 시작하세요
        </p>

        <SignupForm />

        {/* 로그인 페이지로 이동 */}
        <p className="mt-6 text-center text-sm text-ink-mute">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-bold text-link hover:text-link-hover hover:underline"
          >
            로그인
          </Link>
        </p>

        {/* 개인정보 처리방침 링크 */}
        <p className="mt-4 text-center text-xs">
          <Link
            href="/privacy"
            className="text-link hover:text-link-hover hover:underline"
          >
            개인정보 처리방침
          </Link>
        </p>
      </div>
    </div>
  );
}
