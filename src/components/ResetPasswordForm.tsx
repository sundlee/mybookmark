"use client";

// 비밀번호 재설정 폼.
// 이메일의 재설정 링크를 통해 들어오면 URL 의 code 로 복구 세션을 만든 뒤,
// 새 비밀번호를 입력받아 updateUser 로 변경한다.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import Toast from "./Toast";

const supabase = createClient();

// 링크 검증 상태
type LinkState = "checking" | "valid" | "invalid";

function toKoreanError(error: { message: string; code?: string }): string {
  switch (error.code) {
    case "same_password":
      return "기존 비밀번호와 다른 비밀번호를 입력해 주세요.";
    case "weak_password":
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    case "session_not_found":
      return "링크가 만료되었습니다. 다시 시도해 주세요.";
  }
  const m = error.message.toLowerCase();
  if (m.includes("should be at least")) return "비밀번호는 최소 6자 이상이어야 합니다.";
  if (m.includes("auth session missing") || m.includes("session")) {
    return "링크가 만료되었습니다. 다시 요청해 주세요.";
  }
  return "비밀번호 변경에 실패했습니다. 다시 시도해 주세요.";
}

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 마운트 시 복구 세션을 확보한다.
  useEffect(() => {
    let active = true;
    (async () => {
      // 1) 이미 세션이 있으면(자동 감지 포함) 그대로 사용
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        if (active) setLinkState("valid");
        return;
      }
      // 2) URL 의 code 로 세션 교환 시도
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
          if (active) setLinkState("valid");
          return;
        }
        // 교환 실패해도 자동 처리로 세션이 생겼는지 재확인
        const {
          data: { session: retry },
        } = await supabase.auth.getSession();
        if (active) setLinkState(retry ? "valid" : "invalid");
        return;
      }
      if (active) setLinkState("invalid");
    })();
    return () => {
      active = false;
    };
  }, []);

  const canSubmit =
    password !== "" && passwordConfirm !== "" && linkState === "valid" && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(toKoreanError(updateError));
      setLoading(false);
      return;
    }

    // 성공 → 인덱스로 이동 (복구 세션으로 로그인된 상태)
    router.push("/");
  };

  // 링크 검증 중
  if (linkState === "checking") {
    return <p className="py-6 text-center text-sm text-zinc-400">링크 확인 중…</p>;
  }

  // 유효하지 않은/만료된 링크
  if (linkState === "invalid") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          유효하지 않거나 만료된 링크입니다.
          <br />
          비밀번호 재설정을 다시 요청해 주세요.
        </p>
        <Link
          href="/forgot-password"
          className="mt-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          비밀번호 재설정 다시 요청하기
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && <Toast message={error} onClose={() => setError("")} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            새 비밀번호
          </span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            autoFocus
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            새 비밀번호 확인
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
          {loading ? "변경 중…" : "비밀번호 변경"}
        </button>
      </form>
    </>
  );
}
