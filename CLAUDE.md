# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 언어 및 커뮤니케이션 규칙

- **기본 응답 언어**: 한국어
- **코드 주석**: 한국어로 작성
- **커밋 메시지**: 한국어로 작성
- **문서화**: 한국어로 작성
- **변수명/함수명**: 영어 (코드 표준 준수)

## ⚠️ 시작하기 전 필독

`AGENTS.md`에 명시된 대로, 이 프로젝트의 **Next.js(16.2.9)는 학습 데이터의 버전과 다릅니다**. API·관례·파일 구조가 모두 다를 수 있으므로, **코드를 작성하기 전에 반드시 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽으세요.** Deprecation 안내도 확인합니다.

- 문서 구조: `node_modules/next/dist/docs/01-app/` (App Router), `02-pages/`, `03-architecture/`
- 문서 내 `{/* AI agent hint: ... */}` 주석은 버전별 함정을 짚어줍니다. 예: 느린 클라이언트 네비게이션은 Suspense만으로 부족하며 해당 라우트에서 `unstable_instant`를 export해야 함 (`docs/01-app/02-guides/instant-navigation.mdx` 참고).
- 기억에 의존해 추측하지 말고, 해당 기능 문서를 직접 확인한 뒤 작성하세요.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과물 실행
npm run lint     # ESLint 검사
```

테스트 러너는 아직 설정되어 있지 않습니다.

## 아키텍처

- **App Router 기반 Next.js 16 프로젝트.** 모든 라우트·UI는 `app/` 디렉터리에 위치합니다.
  - `app/layout.tsx` — 루트 레이아웃. `next/font/google`로 Geist 폰트를 로드해 CSS 변수(`--font-geist-sans`, `--font-geist-mono`)로 노출. 전역 CSS 임포트 지점.
  - `app/page.tsx` — 루트 페이지(`/`).
  - `app/globals.css` — 전역 스타일.
- **Tailwind CSS v4.** 설정은 JS 설정 파일이 아닌 CSS에서 이루어집니다. `globals.css`에서 `@import "tailwindcss";`로 불러오고 `@theme inline { ... }` 블록으로 테마 토큰(색상·폰트)을 정의합니다. PostCSS 플러그인은 `postcss.config.mjs`의 `@tailwindcss/postcss`. **별도의 `tailwind.config.js`는 없습니다** — 테마 변경은 `globals.css`에서 합니다.
- **TypeScript (strict).** `@/*` 경로 별칭이 프로젝트 루트를 가리킵니다 (`tsconfig.json`의 `paths`). 임포트 시 `@/app/...` 형태를 사용하세요.
- **ESLint (flat config).** `eslint.config.mjs`가 `eslint-config-next`의 core-web-vitals + typescript 규칙을 사용합니다.
