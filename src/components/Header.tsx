"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeProvider";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-2 h-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Menu Icon */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="메뉴"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <Link
                  href="/posts/super-best"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                >
                  <span className="text-orange-500">🏆</span> 슈퍼베스트
                </Link>
                <Link
                  href="/posts/best"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                >
                  <span className="text-yellow-500">🔥</span> 베스트글
                </Link>
                <Link
                  href="/posts"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition"
                >
                  <span className="text-teal-600">📋</span> 게시판
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <Link
                  href="/posts/new"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  <span className="text-blue-500">✏️</span> 새글 쓰기
                </Link>
                <button
                  onClick={() => { toggleTheme(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full text-left"
                >
                  <span>{theme === "dark" ? "☀️" : "🌙"}</span> {theme === "dark" ? "라이트 모드" : "다크 모드"}
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                {status === "authenticated" && session?.user && (
                  <>
                    <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                      {session.user.name}님 로그인 중
                    </div>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/login" }); setMenuOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full text-left"
                    >
                      <span>🚪</span> 로그아웃
                    </button>
                  </>
                )}
                {status === "unauthenticated" && (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <span>🔑</span> 로그인
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                    >
                      <span>📝</span> 회원가입
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link
            href="/posts/super-best"
            className="text-lg font-bold px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 hover:opacity-80 bg-orange-500 text-white border border-orange-600 hover:bg-orange-600"
          >
            슈퍼베스트
          </Link>
          <Link
            href="/posts/best"
            className="text-lg font-bold px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 hover:opacity-80 bg-yellow-500 text-white border border-yellow-600 hover:bg-yellow-600"
          >
            베스트글
          </Link>
          <Link
            href="/posts"
            style={{ backgroundColor: "#044f4f", color: "#b2dfdb", border: "1px solid #066060" }}
            className="text-lg font-bold flex-1 text-center px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 hover:opacity-80"
          >
            게시판
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="테마 전환"
          >
            {theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {status === "loading" && (
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          )}

          {status === "authenticated" && session?.user && (
            <>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-tight">
                {session.user.name}님
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition font-medium"
              >
                로그아웃
              </button>
            </>
          )}

          {status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="text-sm bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
