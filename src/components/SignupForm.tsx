"use client";

// 회원가입 폼 (Supabase Auth 연동).
// - 세 필드 모두 입력해야 버튼 활성화
// - 제출 시 비밀번호 일치 확인
// - 실패하면 한국어 오류를 토스트로 표시, 성공하면 인덱스(/)로 이동

import { useState } from "react";
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
    case "user_already_exists":
    case "email_exists":
      return "이미 가입된 이메일입니다.";
    case "email_address_invalid":
      return "올바른 이메일 주소가 아닙니다.";
    case "weak_password":
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "요청이 많습니다. 잠시 후 다시 시도해 주세요.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "현재 회원가입이 비활성화되어 있습니다.";
    case "validation_failed":
      return "입력값을 확인해 주세요.";
  }

  // 코드가 없을 때 메시지 기반 폴백
  const m = error.message.toLowerCase();
  if (m.includes("already registered")) return "이미 가입된 이메일입니다.";
  if (m.includes("password should be at least")) return "비밀번호는 최소 6자 이상이어야 합니다.";
  if (m.includes("invalid") && m.includes("email")) return "올바른 이메일 주소가 아닙니다.";
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "네트워크 오류가 발생했습니다. 다시 시도해 주세요.";
  }
  return "회원가입에 실패했습니다. 다시 시도해 주세요.";
}

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 세 필드 모두 입력 + 처리 중이 아닐 때만 제출 가능
  const canSubmit =
    email.trim() !== "" && password !== "" && passwordConfirm !== "" && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // 비밀번호 일치 확인
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setError(toKoreanError(signUpError));
      setLoading(false);
      return;
    }

    // 성공 → 인덱스 페이지로 이동
    router.push("/");
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
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            비밀번호 확인
          </span>
          <input
            type="password"
            name="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "처리 중…" : "회원가입"}
        </button>
      </form>
    </>
  );
}
