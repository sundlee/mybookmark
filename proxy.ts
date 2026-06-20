// Next.js 16 Proxy (구 Middleware). 모든 페이지 요청 전에 실행되어
// Supabase 세션을 갱신하고 페이지 접근 제한을 적용한다.

import { type NextRequest } from "next/server";
import { updateSession } from "@/src/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 모든 페이지에 적용하되, API 라우트·정적 자산·이미지·favicon 은 제외
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
