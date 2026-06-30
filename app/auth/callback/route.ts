import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";

// 소셜 로그인(OAuth) 콜백 처리 라우트.
// 카카오 등 공급자 인증을 마치면 ?code= 파라미터와 함께 이 경로로 되돌아온다.
// PKCE 흐름에 따라 code 를 세션으로 교환한 뒤 목적지로 리다이렉트한다.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 로그인 후 돌아갈 경로 (지정이 없으면 인덱스)
  const next = searchParams.get("next") ?? "/";

  // code 가 없으면 잘못된 진입 → 로그인 페이지로 오류 표시
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  // 세션 교환 실패 → 로그인 페이지로 오류 표시
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  // 프로덕션(Vercel 등 로드밸런서 뒤)에서는 원본 호스트가 x-forwarded-host
  // 헤더에 담기므로 이를 우선 사용한다. 로컬 개발 환경에서는 origin 을 쓴다.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const target =
    !isLocalEnv && forwardedHost ? `https://${forwardedHost}${next}` : `${origin}${next}`;

  return NextResponse.redirect(target);
}
