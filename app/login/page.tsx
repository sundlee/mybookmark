import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/src/components/LoginForm";

// 로그인 페이지. 정적 마크업(로고·링크)은 서버 컴포넌트로 두고,
// 상호작용이 필요한 폼은 LoginForm(클라이언트)으로 분리한다.

export const metadata: Metadata = {
  title: "로그인",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // 소셜 로그인 콜백 실패 시 ?error=oauth 로 되돌아온다 → 토스트로 안내
  const { error } = await searchParams;
  const initialError =
    error === "oauth" ? "카카오 로그인에 실패했습니다. 다시 시도해 주세요." : "";

  return (
    // 파스텔-메시 히어로 위에 떠 있는 카드 (그림자 아닌 그라디언트가 lift 를 담당)
    <div className="pastel-mesh flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-canvas p-8 shadow-[0_0_32px_0_rgba(0,0,0,0.1)]">
        {/* 로고 */}
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-primary">
          📑 내 북마크
        </h1>
        <p className="mb-8 text-center text-sm text-ink-mute">
          로그인하고 북마크를 관리하세요
        </p>

        <LoginForm initialError={initialError} />

        {/* 비밀번호 찾기 페이지로 이동 */}
        <p className="mt-4 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-link hover:text-link-hover hover:underline"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </p>

        {/* 회원가입 페이지로 이동 */}
        <p className="mt-2 text-center text-sm text-ink-mute">
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-bold text-link hover:text-link-hover hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
