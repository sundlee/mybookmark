import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
