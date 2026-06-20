// 북마크 관리 앱의 핵심 데이터 모델 정의

/** 북마크가 속하는 카테고리(폴더) */
export interface Category {
  id: string;
  name: string;
  /** 사이드바·카드에서 사용하는 강조 색상 (Tailwind 색상 hex) */
  color: string;
}

/** 저장되는 개별 북마크 */
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  /** 소속 카테고리 id. null 이면 '미분류' */
  categoryId: string | null;
  /** 생성 시각 (epoch ms) — 정렬에 사용 */
  createdAt: number;
}

/** localStorage 에 직렬화되는 전체 앱 상태 */
export interface BookmarkState {
  categories: Category[];
  bookmarks: Bookmark[];
}
