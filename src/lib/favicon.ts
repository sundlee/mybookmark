// URL 관련 유틸리티 — 파비콘 주소 추출 및 도메인 표시용

/** URL 문자열에서 호스트네임을 추출한다. 실패하면 원본 반환 */
export function getHostname(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 스킴이 없으면 https:// 를 붙여 준다 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * 구글 파비콘 서비스로 사이트 아이콘 주소를 만든다.
 * next/image 설정 없이 일반 <img> 로 사용하므로 외부 도메인 제약이 없다.
 */
export function getFaviconUrl(url: string, size = 64): string {
  const host = getHostname(url);
  return `https://www.google.com/s/2/favicons?sz=${size}&domain=${encodeURIComponent(host)}`;
}
