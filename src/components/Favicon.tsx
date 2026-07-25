"use client";

// 사이트 파비콘 표시 컴포넌트.
// 외부(구글) 파비콘 서비스를 일반 <img> 로 불러오고,
// 로딩 실패 시 도메인 첫 글자 배지로 대체한다.

import { useState } from "react";
import { getFaviconUrl, getHostname } from "@/src/lib/favicon";

interface FaviconProps {
  url: string;
  /** 정사각 크기(px) */
  size?: number;
}

export default function Favicon({ url, size = 36 }: FaviconProps) {
  const [failed, setFailed] = useState(false);
  const host = getHostname(url);
  const letter = (host[0] ?? "?").toUpperCase();

  if (failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-surface-card font-medium text-muted"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        aria-hidden
      >
        {letter}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 외부 파비콘은 next/image 원격 설정 불필요한 일반 img 사용
    <img
      src={getFaviconUrl(url, 64)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-lg bg-canvas object-contain"
      style={{ width: size, height: size }}
    />
  );
}
