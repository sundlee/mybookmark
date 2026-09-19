// PostgREST 의 JWT 시각 오류(PGRST303)를 잠시 후 재시도하는 헬퍼.
//
// 배경: Supabase 의 인증 서버(GoTrue)와 데이터 API(PostgREST)는 서로 다른 서버라 시계가
// 몇 초 어긋날 수 있다. 그러면 방금 발급된 액세스 토큰의 iat(발급 시각)가 PostgREST 기준으로는
// "미래"가 되어 401 "JWT issued at future" 로 거부된다. 세션이 갱신된 직후
// (한동안 안 쓰다가 첫 접속했을 때·로그인 직후)에 주로 나타나고, 몇 초만 지나면 같은 토큰으로
// 정상 처리되는 일시적 오류다. 클라이언트에서 고칠 수 없는 서버 시계 문제이므로
// 감지되면 잠깐 기다렸다가 같은 요청을 다시 보낸다.
// 참고: https://github.com/orgs/supabase/discussions/48123

/** PostgREST 오류 중 이 헬퍼가 보는 최소 필드 */
interface PostgrestLikeError {
  code?: string;
  message: string;
}

/** Supabase 쿼리 결과 중 이 헬퍼가 보는 최소 필드 */
interface PostgrestLikeResult {
  error: PostgrestLikeError | null;
}

/** PostgREST 가 JWT 의 시각 클레임(iat·exp·nbf) 검증에 실패했을 때 내는 오류 코드 */
export const JWT_CLOCK_ERROR_CODE = "PGRST303";

/** 재시도 전 대기 시간(ms). 순서대로 적용되며, 모두 소진하면 마지막 결과를 그대로 돌려준다. */
export const JWT_RETRY_DELAYS_MS: readonly number[] = [1000, 2000, 3000];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** 서버 시계 편차로 인한 일시적 JWT 오류인지 판별 */
export function isJwtClockError(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;
  return error.code === JWT_CLOCK_ERROR_CODE || /issued at future/i.test(error.message);
}

/**
 * 쿼리를 실행하고, JWT 시각 오류면 잠시 기다렸다가 다시 실행한다.
 * `run` 은 호출할 때마다 새 쿼리 빌더를 만들어야 한다 (빌더 인스턴스를 재사용하지 않도록).
 * 인증 단계에서 거부된 요청은 DB 에 도달하지 않으므로 insert/update/delete 도 안전하게 재시도할 수 있다.
 */
export async function withJwtClockRetry<T extends PostgrestLikeResult>(
  run: () => PromiseLike<T>,
  delays: readonly number[] = JWT_RETRY_DELAYS_MS,
  wait: (ms: number) => Promise<void> = sleep,
): Promise<T> {
  let result = await run();
  for (const delay of delays) {
    if (!isJwtClockError(result.error)) break;
    await wait(delay);
    result = await run();
  }
  return result;
}
