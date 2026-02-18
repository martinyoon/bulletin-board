"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface PostItem {
  id: string;
  title: string;
  createdAt: string | Date;
  author: { name: string };
  _count: { comments: number; likes: number };
}

interface BottomPostListProps {
  posts: PostItem[];
  currentPostId: string;
  totalPages: number;
  currentPostPage: number;
}

function formatRelativeTime(dateString: string | Date) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

function getReadPosts(): Set<string> {
  try {
    const data = localStorage.getItem("read-posts");
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

function markAsRead(postId: string) {
  try {
    const readSet = getReadPosts();
    readSet.add(postId);
    // Keep only last 500 to prevent localStorage bloat
    const arr = [...readSet];
    if (arr.length > 500) arr.splice(0, arr.length - 500);
    localStorage.setItem("read-posts", JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export default function BottomPostList({ posts, currentPostId, totalPages, currentPostPage }: BottomPostListProps) {
  const [readPosts, setReadPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    markAsRead(currentPostId);
    setReadPosts(getReadPosts());
  }, [currentPostId]);

  return (
    <div style={{ borderTop: "1px solid #3A3D44" }} className="mt-2 pt-2">
      <h3 style={{ color: "#CBD5E1" }} className="text-sm font-bold mb-1 flex items-center gap-1">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        게시판 목록
      </h3>
      <div className="space-y-0">
        {posts.map((p) => {
          const isCurrent = p.id === currentPostId;
          const isRead = !isCurrent && readPosts.has(p.id);

          return (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              style={{ borderBottom: "1px solid #3A3D44" }}
              className={`block py-1.5 px-1.5 transition text-sm ${
                isCurrent
                  ? "bg-blue-900/20 border-l-4 border-l-blue-500"
                  : "hover:bg-[#282B31] border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  style={{ color: isCurrent ? "#60A5FA" : isRead ? "#78849B" : "#E5E7EB" }}
                  className={`flex items-center flex-1 min-w-0 ${isCurrent ? "font-bold" : ""}`}
                >
                  <span className="truncate">{isCurrent && "▶ "}{p.title}</span>
                  {p._count.comments > 0 && (
                    <span style={{ color: "#F59E0B" }} className="ml-1 font-bold shrink-0">[{p._count.comments}]</span>
                  )}
                </span>
                <span style={{ color: "#64748B" }} className="flex items-center gap-1.5 text-xs ml-2 shrink-0">
                  <span>{p.author.name}</span>
                  <span className="flex items-center gap-0.5">
                    <span className="text-[10px]">👍</span>
                    {p._count.likes}
                  </span>
                  <span>{formatRelativeTime(p.createdAt)}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {totalPages > 1 && (() => {
        const groupSize = 5;
        const groupStart = Math.floor((currentPostPage - 1) / groupSize) * groupSize + 1;
        const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
        const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);

        return (
          <div className="mt-1.5 flex items-center justify-center gap-1">
            {groupStart > 1 ? (
              <Link
                href={`/posts?page=${groupStart - 1}`}
                style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-80 transition"
              >
                이전
              </Link>
            ) : (
              <span style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#64748B" }} className="rounded-lg border px-3 py-1.5 text-sm font-medium cursor-not-allowed">
                이전
              </span>
            )}

            {pages.map((p) => (
              p === currentPostPage ? (
                <span
                  key={p}
                  style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
                  className="rounded-lg px-3 py-1.5 text-sm font-bold"
                >
                  {p}
                </span>
              ) : (
                <Link
                  key={p}
                  href={`/posts?page=${p}`}
                  style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-80 transition"
                >
                  {p}
                </Link>
              )
            ))}

            {groupEnd < totalPages ? (
              <Link
                href={`/posts?page=${groupEnd + 1}`}
                style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-80 transition"
              >
                다음
              </Link>
            ) : (
              <span style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#64748B" }} className="rounded-lg border px-3 py-1.5 text-sm font-medium cursor-not-allowed">
                다음
              </span>
            )}
          </div>
        );
      })()}
    </div>
  );
}
