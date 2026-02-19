"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const isDirty = title !== initialTitle || content !== initialContent;

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    },
    [isDirty]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

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
    <form id="post-form" onSubmit={handleSubmit} className="space-y-1">
      {error && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "#7F1D1D", color: "#F87171" }} className="p-1 text-xs border-b leading-tight">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          style={{ color: "#CBD5E1" }}
          className="block text-xs font-semibold mb-0.5 leading-tight"
        >
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
          className="w-full border px-2 py-1 text-sm placeholder-[#64748B] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="content"
          style={{ color: "#CBD5E1" }}
          className="block text-xs font-semibold mb-0.5 leading-tight"
        >
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={12}
          style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
          className="w-full border px-2 py-1 text-sm placeholder-[#64748B] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition resize-y"
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (isDirty) {
              setShowLeaveConfirm(true);
            } else {
              router.back();
            }
          }}
          disabled={loading}
          style={{ borderColor: "#3A3D44", color: "#CBD5E1" }}
          className="border px-3 py-1.5 text-xs font-semibold hover:bg-[#282B31] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition disabled:opacity-50"
        >
          취소
        </button>
      </div>
      <ConfirmModal
        open={showLeaveConfirm}
        title="작성 중인 내용이 있습니다"
        message="페이지를 떠나면 작성 중인 내용이 사라집니다. 정말 나가시겠습니까?"
        confirmText="나가기"
        cancelText="계속 작성"
        onConfirm={() => { setShowLeaveConfirm(false); router.back(); }}
        onCancel={() => setShowLeaveConfirm(false)}
        danger
      />
    </form>
  );
}
