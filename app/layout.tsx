import type { Metadata } from "next";
import { Inter, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

// Claude(Anthropic 영감) 디자인 시스템 — DESIGN.md 참고.
// - 본문/UI: StyreneB 의 오픈소스 대체로 Inter
// - 디스플레이 헤드라인: 프로퍼티어리 Copernicus 세리프의 대체.
//   한국어 UI 이므로 CJK 세리프(Noto Serif KR)로 에디토리얼 세리프 보이스를 구현한다.
//   (CJK 폰트는 용량이 커 preload 불가 → preload: false)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  preload: false,
});

// 페이지별 메타데이터: 각 page.tsx 가 title 을 덮어쓰면 template 으로 "○○ · 내 북마크" 형태가 된다.
// favicon 은 app/favicon.ico 파일 규약으로 자동 적용되므로 별도 설정하지 않는다.
const SITE_NAME = "내 북마크";
const DESCRIPTION = "자주 가는 페이지를 카테고리로 관리하는 북마크 앱";

export const metadata: Metadata = {
  // OG 이미지 등 상대경로를 절대 URL 로 변환하기 위한 기준 주소
  metadataBase: new URL("https://mybookmark-eta.vercel.app"),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/thumbnail.png", // public/thumbnail.png
        width: 866,
        height: 1300,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: ["/thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${notoSerifKr.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-canvas text-body">{children}</body>
    </html>
  );
}
