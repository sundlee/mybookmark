// 오픈 그래프 메타데이터 추출 API.
// GET /api/og?url=<대상 URL>
// 대상 페이지의 HTML 을 받아 og:title/description/image/url 등을 파싱해 JSON 으로 반환한다.
// request.url 을 읽으므로 자동으로 동적(runtime) 라우트로 처리된다.

import type { NextRequest } from "next/server";
import type { OgMetadata } from "@/src/lib/types";
import { normalizeUrl } from "@/src/lib/favicon";

// HTML 본문을 너무 많이 읽지 않도록 상한 (대부분의 <head> 메타는 앞부분에 있음)
const MAX_BYTES = 512 * 1024; // 512KB
const FETCH_TIMEOUT_MS = 8000;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return Response.json({ error: "url 파라미터가 필요합니다." }, { status: 400 });
  }

  const target = normalizeUrl(raw);
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return Response.json({ error: "유효하지 않은 URL 입니다." }, { status: 400 });
  }
  // http/https 외 프로토콜 차단 (file:, data: 등 방지)
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return Response.json({ error: "http(s) URL 만 지원합니다." }, { status: 400 });
  }

  try {
    const res = await fetch(target, {
      headers: {
        // 일부 사이트가 기본 fetch UA 를 차단하므로 브라우저 UA 를 흉내낸다
        "User-Agent":
          "Mozilla/5.0 (compatible; MyBookmarkBot/1.0; +https://example.com/bot)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      return Response.json(
        { error: `페이지를 가져오지 못했습니다 (HTTP ${res.status}).` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) {
      // HTML 이 아니면 메타를 파싱할 수 없으므로 최소 정보만 반환
      return Response.json(emptyResult(parsed));
    }

    // 바이트로 읽은 뒤, 페이지의 실제 인코딩을 감지해 디코딩한다.
    // (EUC-KR 등 비 UTF-8 페이지의 한글 깨짐 방지)
    const { bytes, ascii } = await readLimited(res, MAX_BYTES);
    const charset = detectCharset(contentType, ascii);
    const html = decodeBytes(bytes, charset);
    const meta = parseOgMetadata(html, parsed);
    return Response.json(meta);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "페이지 응답이 시간 초과되었습니다."
        : "페이지를 가져오는 중 오류가 발생했습니다.";
    return Response.json({ error: message }, { status: 502 });
  }
}

/**
 * 응답 본문을 최대 maxBytes 까지 바이트로 읽는다.
 * - bytes: 원본 바이트 (실제 인코딩으로 나중에 디코딩)
 * - ascii: 인코딩 감지·조기 종료용 latin1 디코딩 문자열(메타태그는 ASCII 라 안전)
 */
async function readLimited(
  res: Response,
  maxBytes: number,
): Promise<{ bytes: Uint8Array; ascii: string }> {
  const buf = res.body
    ? await readStream(res.body, maxBytes)
    : new Uint8Array(await res.arrayBuffer());
  const bytes = buf.byteLength > maxBytes ? buf.subarray(0, maxBytes) : buf;
  const ascii = new TextDecoder("latin1").decode(bytes);
  return { bytes, ascii };
}

/** 스트림을 maxBytes 까지(또는 </head> 까지) 읽어 하나의 Uint8Array 로 합친다 */
async function readStream(
  body: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Uint8Array> {
  const reader = body.getReader();
  const latin1 = new TextDecoder("latin1");
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (received < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    // 현재 청크에 </head> 가 있으면 충분 (메타태그는 head 안에 있음).
    // 청크 경계로 잘린 경우는 maxBytes 상한으로 종료된다.
    if (latin1.decode(value, { stream: true }).includes("</head>")) break;
  }
  await reader.cancel().catch(() => {});

  const total = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    total.set(c, offset);
    offset += c.byteLength;
  }
  return total;
}

/** Content-Type 헤더 또는 HTML meta 태그에서 문자 인코딩을 감지 (없으면 utf-8) */
function detectCharset(contentType: string, ascii: string): string {
  const fromHeader = contentType.match(/charset=["']?([^"';\s]+)/i)?.[1];
  if (fromHeader) return fromHeader.trim();
  // <meta charset="euc-kr">
  const metaCharset = ascii.match(/<meta[^>]+charset=["']?([^"'>\s/]+)/i)?.[1];
  if (metaCharset) return metaCharset.trim();
  // <meta http-equiv="Content-Type" content="text/html; charset=euc-kr">
  const httpEquiv = ascii.match(/charset=["']?([^"'>;\s/]+)/i)?.[1];
  return httpEquiv?.trim() ?? "utf-8";
}

/** 감지한 인코딩으로 바이트를 디코딩. 지원하지 않는 라벨이면 utf-8 로 폴백 */
function decodeBytes(bytes: Uint8Array, charset: string): string {
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

/** OG 및 표준 메타태그를 추출한다 */
function parseOgMetadata(html: string, base: URL): OgMetadata {
  const ogTitle = matchMeta(html, "og:title");
  const ogDesc = matchMeta(html, "og:description");
  const ogImage = matchMeta(html, "og:image");
  const ogUrl = matchMeta(html, "og:url");

  const title = ogTitle || matchTitleTag(html) || base.hostname;
  const description = ogDesc || matchMeta(html, "description", "name") || "";
  const image = ogImage ? toAbsolute(ogImage, base) : "";
  const url = ogUrl ? toAbsolute(ogUrl, base) : base.toString();

  return {
    title: decodeEntities(title).trim(),
    description: decodeEntities(description).trim(),
    image,
    url,
  };
}

/**
 * <meta property="og:xxx" content="..."> 또는 <meta name="xxx" content="...">
 * 속성 순서(property/content 가 뒤바뀐 경우)도 처리한다.
 */
function matchMeta(html: string, key: string, attr: "property" | "name" = "property"): string {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // content 가 뒤에 오는 일반적 순서
  const forward = new RegExp(
    `<meta[^>]+${attr}=["']${esc}["'][^>]*\\scontent=["']([^"']*)["']`,
    "i",
  );
  // content 가 앞에 오는 순서
  const backward = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*\\s${attr}=["']${esc}["']`,
    "i",
  );
  return html.match(forward)?.[1] ?? html.match(backward)?.[1] ?? "";
}

/** <title> 태그 내용 추출 */
function matchTitleTag(html: string): string {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "";
}

/** 상대 경로 이미지/URL 을 절대 주소로 변환 */
function toAbsolute(value: string, base: URL): string {
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

/** 자주 쓰이는 HTML 엔티티만 간단히 디코드 */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** HTML 파싱이 불가능할 때의 최소 결과 */
function emptyResult(base: URL): OgMetadata {
  return { title: base.hostname, description: "", image: "", url: base.toString() };
}
