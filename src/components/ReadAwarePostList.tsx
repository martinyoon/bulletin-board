"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface PostItem {
  id: string;
  title: string;
  createdAt: string | Date;
  author: { id: string; name: string };
  _count: { comments: number; likes: number; dislikes: number };
}

interface ReadAwarePostListProps {
  posts: PostItem[];
}

const AVATAR_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
];

function getAvatarColor(name: string) {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
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

export default function ReadAwarePostList({ posts }: ReadAwarePostListProps) {
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
            href={`/posts/${post.id}`}
            className="block border-b border-gray-200 dark:border-gray-800 py-1.5 px-1 hover:bg-gray-50 dark:hover:bg-gray-900 transition group relative border-l-4 border-l-transparent hover:border-l-teal-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate leading-tight ${
                  isRead
                    ? "text-gray-400 dark:text-gray-600"
                    : "text-gray-900 dark:text-white"
                }`}>
                  {post.title}
                  {post._count.likes >= 1 && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 align-middle">
                      🔥 베스트
                    </span>
                  )}
                </h2>
                <div className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 leading-tight">
                  <span className="flex items-center gap-1">
                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white ${getAvatarColor(post.author.name)}`}>
                      {post.author.name[0]}
                    </span>
                    {post.author.name}
                  </span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  <span className="flex items-center gap-0.5">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post._count.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.694 0-1.372.271-1.873.744L3.342 5.65a2.252 2.252 0 00-.083 3.16l.012.013c.104.12.183.258.231.408l.07.222a3.252 3.252 0 002.287 2.282c.2.055.406.092.616.11l.455.04c.512.045.898.476.898.99v2.07a2.25 2.25 0 01-1.5 2.122" />
                    </svg>
                    {post._count.dislikes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {post._count.comments}
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
