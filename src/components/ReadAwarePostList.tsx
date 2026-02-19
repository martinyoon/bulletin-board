"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthorLink from "@/components/AuthorLink";

interface PostItem {
  id: string;
  title: string;
  createdAt: string | Date;
  author: { id: string; name: string };
  _count: { comments: number; likes: number; dislikes: number };
}

interface ReadAwarePostListProps {
  posts: PostItem[];
  currentPage?: number;
  searchQuery?: string;
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query?: string) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ backgroundColor: "rgba(59,130,246,0.3)", color: "#60A5FA" }} className="rounded px-0.5">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
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

export default function ReadAwarePostList({ posts, currentPage, searchQuery }: ReadAwarePostListProps) {
  const [readPosts, setReadPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadPosts(getReadPosts());
  }, []);

  return (
    <div className="space-y-0">
      {posts.map((post) => {
        const isRead = readPosts.has(post.id);

        return (
          <Link
            key={post.id}
            href={`/posts/${post.id}${currentPage && currentPage > 1 ? `?page=${currentPage}` : ""}`}
            style={{ borderBottom: "1px solid #3A3D44" }}
            className="block py-1.5 px-1 hover:bg-[#282B31] transition group relative border-l-4 border-l-transparent hover:border-l-blue-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2
                  style={{ color: isRead ? "#78849B" : "#E5E7EB" }}
                  className="text-lg font-semibold group-hover:text-blue-400 transition leading-tight flex items-center"
                >
                  <span className="truncate">{highlightText(post.title, searchQuery)}</span>
                  {post._count.comments > 0 && (
                    <span style={{ color: "#F59E0B" }} className="ml-1 text-sm font-bold shrink-0">[{post._count.comments}]</span>
                  )}
                  {post._count.likes >= 1 && (
                    <span style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#F87171" }} className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                      🔥 베스트
                    </span>
                  )}
                </h2>
                <div style={{ color: "#94A3B8" }} className="mt-0.5 flex items-center gap-1 text-sm leading-tight">
                  <span className="flex items-center gap-1">
                    <span style={{ backgroundColor: "#3A3D44", color: "#CBD5E1" }} className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold">
                      {post.author.name[0]}
                    </span>
                    <AuthorLink href={`/users/${post.author.id}`} style={{ color: "#94A3B8" }} className="hover:text-blue-400 hover:underline">{post.author.name}</AuthorLink>
                  </span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  <span className="flex items-center gap-0.5">
                    <span className="text-xs">👍</span>
                    {post._count.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="text-xs">👎</span>
                    {post._count.dislikes}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
