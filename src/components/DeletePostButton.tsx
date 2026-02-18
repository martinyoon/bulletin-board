"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeletePostButtonProps {
  postId: string;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      router.push("/posts");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{ borderColor: "#7F1D1D", color: "#F87171" }}
      className="rounded-lg border px-2 py-1 text-sm font-semibold hover:bg-red-900/20 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "삭제 중..." : "삭제"}
    </button>
  );
}
