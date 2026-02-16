"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostFormProps {
  initialTitle?: string;
  initialContent?: string;
  postId?: string;
  mode: "create" | "edit";
}

export default function PostForm({
  initialTitle = "",
  initialContent = "",
  postId,
  mode,
}: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url =
        mode === "create" ? "/api/posts" : `/api/posts/${postId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "오류가 발생했습니다.");
      }

      router.refresh();
      if (mode === "create") {
        router.push("/posts");
      } else {
        router.push(`/posts/${postId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-1 text-xs text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-800 leading-tight">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5 leading-tight"
        >
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 text-sm text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5 leading-tight"
        >
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={12}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 text-sm text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition resize-y"
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "저장 중..."
            : mode === "create"
              ? "작성하기"
              : "수정하기"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-200 focus:outline-none transition disabled:opacity-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
