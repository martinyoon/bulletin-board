"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

interface DeletePostButtonProps {
  postId: string;
  returnHref?: string;
}

export default function DeletePostButton({ postId, returnHref = "/posts" }: DeletePostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      router.push(returnHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        style={{ borderColor: "#7F1D1D", color: "#F87171" }}
        className="rounded-lg border px-2 py-1 text-sm font-semibold hover:bg-red-900/20 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "삭제 중..." : "삭제"}
      </button>
      {error && (
        <span style={{ color: "#F87171" }} className="text-xs ml-1">{error}</span>
      )}
      <ConfirmModal
        open={showConfirm}
        title="게시글 삭제"
        message="정말 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        danger
      />
    </>
  );
}
