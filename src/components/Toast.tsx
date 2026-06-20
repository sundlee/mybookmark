"use client";

// 화면 중앙 상단에 뜨는 간단한 토스트 알림.
// duration(ms) 후 자동으로 닫힌다.

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  /** 자동 닫힘 시간(ms) */
  duration?: number;
}

export default function Toast({ message, onClose, duration = 4000 }: ToastProps) {
  // 일정 시간 후 자동 닫힘 (타이머 구독이므로 effect 사용이 적절)
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      role="alert"
      className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {message}
    </div>
  );
}
