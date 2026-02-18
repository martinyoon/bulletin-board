"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { href: "/posts/super-best", label: "슈퍼베스트" },
    { href: "/posts/best", label: "베스트글" },
    { href: "/posts", label: "게시판" },
  ];

  // 게시글 상세 페이지 여부 (/posts/[id] 또는 /posts/[id]/edit)
  const isPostDetail = pathname.startsWith("/posts/") &&
    !pathname.startsWith("/posts/best") &&
    !pathname.startsWith("/posts/super-best") &&
    !pathname.startsWith("/posts/new");

  // sessionStorage에서 마지막 탭 읽기 (SSR 안전)
  const [lastTab, setLastTab] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try { return sessionStorage.getItem("last-tab"); } catch { return null; }
    }
    return null;
  });

  // 목록 페이지 방문 시 sessionStorage에 저장
  useEffect(() => {
    try {
      if (pathname === "/posts") {
        sessionStorage.setItem("last-tab", "/posts");
        setLastTab("/posts");
      } else if (pathname.startsWith("/posts/super-best")) {
        sessionStorage.setItem("last-tab", "/posts/super-best");
        setLastTab("/posts/super-best");
      } else if (pathname.startsWith("/posts/best")) {
        sessionStorage.setItem("last-tab", "/posts/best");
        setLastTab("/posts/best");
      }
    } catch {}
  }, [pathname]);

  function isActive(href: string) {
    // 게시글 상세에서는 sessionStorage 기반으로 판단
    if (isPostDetail && lastTab) {
      return lastTab === href;
    }
    if (href === "/posts") return pathname === "/posts" || (pathname.startsWith("/posts") && !pathname.startsWith("/posts/best") && !pathname.startsWith("/posts/super-best"));
    return pathname.startsWith(href);
  }

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
    <header style={{ backgroundColor: "#1F2126", borderBottom: "1px solid #3A3D44" }} className="sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-2 h-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Menu Icon */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ color: "#94A3B8" }}
              className="p-1.5 rounded-lg hover:bg-[#282B31] transition"
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
              <div style={{ backgroundColor: "#282B31", border: "1px solid #3A3D44" }} className="absolute left-0 top-full mt-1 w-48 rounded-lg shadow-lg py-1 z-10">
                <Link
                  href="/posts/super-best"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: "#CBD5E1" }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#3A3D44] transition"
                >
                  <span>🏆</span> 슈퍼베스트
                </Link>
                <Link
                  href="/posts/best"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: "#CBD5E1" }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#3A3D44] transition"
                >
                  <span>🔥</span> 베스트글
                </Link>
                <Link
                  href="/posts"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: "#CBD5E1" }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#3A3D44] transition"
                >
                  <span>📋</span> 게시판
                </Link>
                <div style={{ borderColor: "#3A3D44" }} className="border-t my-1" />
                <Link
                  href="/posts/new"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: "#60A5FA" }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#3A3D44] transition"
                >
                  <span>✏️</span> 새글 쓰기
                </Link>
                <div style={{ borderColor: "#3A3D44" }} className="border-t my-1" />
                {status === "authenticated" && session?.user && (
                  <>
                    <div className="px-3 py-2 text-xs" style={{ color: "#64748B" }}>
                      {session.user.name}님 로그인 중
                    </div>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/login" }); setMenuOpen(false); }}
                      style={{ color: "#F87171" }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#3A3D44] transition w-full text-left"
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
                      style={{ color: "#CBD5E1" }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#3A3D44] transition"
                    >
                      <span>🔑</span> 로그인
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      style={{ color: "#60A5FA" }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#3A3D44] transition"
                    >
                      <span>📝</span> 회원가입
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="relative whitespace-nowrap px-3 py-2 text-sm font-bold transition"
                  style={{ color: active ? "#6366F1" : "#9CA3AF" }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#CBD5E1"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#9CA3AF"; }}
                >
                  {tab.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0"
                      style={{ height: "3px", backgroundColor: "#6366F1", borderRadius: "2px 2px 0 0" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {status === "loading" && (
            <div className="h-5 w-24 rounded animate-pulse" style={{ backgroundColor: "#3A3D44" }} />
          )}

          {status === "authenticated" && session?.user && (
            <>
              <span className="text-sm font-medium leading-tight" style={{ color: "#CBD5E1" }}>
                {session.user.name}님
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm transition font-medium"
                style={{ color: "#94A3B8" }}
              >
                로그아웃
              </button>
            </>
          )}

          {status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                className="text-sm transition font-medium"
                style={{ color: "#94A3B8" }}
              >
                로그인
              </Link>
              <Link
                href="/register"
                style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
                className="text-sm px-2 py-1 rounded-lg hover:opacity-90 transition font-medium"
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
