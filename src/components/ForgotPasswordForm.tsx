"use client";

// 비밀번호 찾기 폼.
// 입력한 이메일로 비밀번호 재설정 링크를 발송한다(Supabase resetPasswordForEmail).
// 보안상 이메일 존재 여부와 무관하게 항상 "발송됨" 안내를 보여준다.

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/src/utils/supabase/client";
import Toast from "./Toast";

const supabase = createClient();

function toKoreanError(error: { message: string; code?: string }): string {
  switch (error.code) {
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "요청이 많습니다. 잠시 후 다시 시도해 주세요.";
    case "validation_failed":
      return "올바른 이메일을 입력해 주세요.";
  }
  if (error.message.toLowerCase().includes("network")) {
    return "네트워크 오류가 발생했습니다. 다시 시도해 주세요.";
  }
  return "링크 발송에 실패했습니다. 다시 시도해 주세요.";
}

const inputClass =
  "rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const canSubmit = email.trim() !== "" && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` },
    );
    setLoading(false);

    if (resetError) {
      setError(toKoreanError(resetError));
      return;
    }
    setSent(true);
  };

  // 발송 완료 화면
  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="text-4xl">📧</div>
        <p className="text-sm text-muted">
          <span className="font-medium text-ink">{email.trim()}</span> 으로
          <br />
          비밀번호 재설정 링크를 보냈습니다.
          <br />
          메일함을 확인해 주세요.
        </p>
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-primary hover:text-primary-active hover:underline"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && <Toast message={error} onClose={() => setError("")} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            이메일
          </span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
        >
          {loading ? "발송 중…" : "비밀번호 재설정 링크 발송"}
        </button>
      </form>
    </>
  );
}
