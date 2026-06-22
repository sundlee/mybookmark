// Supabase 세션 갱신 + 페이지 접근 제한 헬퍼.
// proxy.ts(Next.js 16 의 미들웨어)에서 호출한다.
// 요청 쿠키의 세션을 검증해, 미로그인 사용자가 보호 경로에 접근하면 /login 으로 보낸다.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// 로그인 없이 접근 가능한 경로 (그 외 모든 페이지는 로그인 필수)
// 비밀번호 찾기/재설정은 로그아웃 상태에서 접근하므로 공개로 둔다.
const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

// 로그인 여부와 무관하게 누구나 접근 가능한 경로.
// 인증 페이지와 달리, 로그인 상태에서도 인덱스로 리다이렉트하지 않는다.
// - /privacy: 개인정보 처리방침
// - /auth: 소셜 로그인(OAuth) 콜백. 이 시점엔 아직 세션이 없으므로 통과시켜야 한다.
const OPEN_PATHS = ["/privacy", "/auth"];

export async function updateSession(request: NextRequest) {
  // 세션 쿠키 갱신 결과를 담을 응답 객체
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // ⚠️ createServerClient 와 getUser 사이에 다른 코드를 넣지 말 것
  // (세션 동기화가 깨져 임의 로그아웃이 발생할 수 있음 — Supabase 권장사항)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  const isOpen = OPEN_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  // 누구나 접근 가능한 경로(예: 개인정보 처리방침)는 리다이렉트 없이 통과
  if (isOpen) {
    return supabaseResponse;
  }

  // 미로그인 + 보호 경로 → 로그인 페이지로 리다이렉트
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 로그인 상태 + 인증 페이지(/login·/signup) 접근 → 인덱스로 리다이렉트
  if (user && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
