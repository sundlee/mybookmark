"use client";

// 로그인 폼 (Supabase Auth 연동).
// - 이메일·비밀번호 모두 입력해야 버튼 활성화
// - 실패하면 한국어 오류를 토스트로 표시, 성공하면 인덱스(/)로 이동

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import Toast from "./Toast";

const supabase = createClient();

/**
 * Supabase 인증 오류를 한국어 메시지로 변환.
 * 우선 error_code(안정적)로 매칭하고, 없으면 메시지 문자열로 폴백한다.
 */
function toKoreanError(error: { message: string; code?: string }): string {
  switch (error.code) {
    case "invalid_credentials":
    case "user_not_found":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "email_not_confirmed":
      return "이메일 인증이 필요합니다. 메일함을 확인해 주세요.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "요청이 많습니다. 잠시 후 다시 시도해 주세요.";
    case "signup_disabled":
      return "현재 로그인이 비활성화되어 있습니다.";
  }

  // 코드가 없을 때 메시지 기반 폴백
  const m = error.message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (m.includes("email not confirmed")) {
    return "이메일 인증이 필요합니다. 메일함을 확인해 주세요.";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "네트워크 오류가 발생했습니다. 다시 시도해 주세요.";
  }
  return "로그인에 실패했습니다. 다시 시도해 주세요.";
}

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 이메일·비밀번호 모두 입력 + 처리 중이 아닐 때만 제출 가능
  const canSubmit = email.trim() !== "" && password !== "" && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(toKoreanError(signInError));
      setLoading(false);
      return;
    }

    // 성공 → 인덱스 페이지로 이동
    router.push("/");
  };

  // 카카오 소셜 로그인 시작.
  // 성공하면 카카오 인증 페이지로 리다이렉트되고, 인증 후 /auth/callback 으로 돌아온다.
  const handleKakaoLogin = async () => {
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    // 리다이렉트 전에 오류가 나면(네트워크 등) 여기서 처리한다.
    if (oauthError) {
      setError("카카오 로그인에 실패했습니다. 다시 시도해 주세요.");
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Toast message={error} onClose={() => setError("")} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            이메일
          </span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            비밀번호
          </span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "처리 중…" : "로그인"}
        </button>
      </form>

      {/* 구분선 */}
      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs text-zinc-400">또는</span>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* 카카오 소셜 로그인 버튼 (카카오 공식 버튼 이미지 사용) */}
      <button
        type="button"
        onClick={handleKakaoLogin}
        disabled={loading}
        aria-label="카카오 로그인"
        className="block w-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Image
          src="/kakao_login_large_wide.png"
          alt="카카오 로그인"
          width={600}
          height={90}
          priority
          className="h-auto w-full"
        />
      </button>
    </>
  );
}
