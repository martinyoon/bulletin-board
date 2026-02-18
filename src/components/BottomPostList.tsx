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

export default function BottomPostList({ posts, currentPostId }: BottomPostListProps) {
  const [readPosts, setReadPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    markAsRead(currentPostId);
    setReadPosts(getReadPosts());
  }, [currentPostId]);

  return (
    <div className="mt-2 border-t border-gray-200 dark:border-gray-800 pt-2">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
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
              className={`block border-b border-gray-100 dark:border-gray-800 py-1.5 px-1.5 transition text-sm ${
                isCurrent
                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`truncate flex-1 ${
                  isCurrent
                    ? "font-bold text-blue-700 dark:text-blue-400"
                    : isRead
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-gray-800 dark:text-gray-200"
                }`}>
                  {isCurrent && "▶ "}{p.title}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 ml-2 shrink-0">
                  <span>{p.author.name}</span>
                  <span className="flex items-center gap-0.5">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {p._count.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {p._count.comments}
                  </span>
                  <span>{formatRelativeTime(p.createdAt)}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-1.5 text-center">
        <Link
          href="/posts"
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          전체 목록 보기 →
        </Link>
      </div>
    </div>
  );
}
