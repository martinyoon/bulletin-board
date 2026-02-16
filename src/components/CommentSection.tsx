"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  author: {
    id: string;
    name: string;
  };
  replies: Comment[];
}

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
}

export default function CommentSection({
  postId,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setTotalCount(data.totalCount);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("댓글 내용을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "댓글 작성에 실패했습니다.");
      }

      setContent("");
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: string, replyContent: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent.trim(), parentId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "답글 작성에 실패했습니다.");
    }

    await fetchComments();
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까? 하위 답글도 함께 삭제됩니다.")) return;

    try {
      const res = await fetch(
        `/api/posts/${postId}/comments?commentId=${commentId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "댓글 삭제에 실패했습니다.");
      }

      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  return (
    <div className="mt-1">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
        댓글 ({totalCount})
      </h3>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-1 text-xs text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-800 mb-0.5 leading-tight">
          {error}
        </div>
      )}

      {/* Comment list */}
      <div className="space-y-0 mb-1">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-xs py-1 leading-tight">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onDelete={handleDelete}
              depth={0}
            />
          ))
        )}
      </div>

      {/* Top-level comment form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-0.5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 작성하세요..."
            rows={2}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 text-xs text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition resize-y leading-tight"
            disabled={loading}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "작성 중..." : "댓글 작성"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-1 border-b border-dashed border-gray-300 dark:border-gray-600 leading-tight">
          댓글을 작성하려면{" "}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            로그인
          </a>
          해주세요.
        </p>
      )}
    </div>
  );
}

/* ─── 개별 댓글 컴포넌트 (재귀) ─── */

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  depth,
}: {
  comment: Comment;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 깊이별 세로선 색상
  const borderColors = [
    "border-blue-400 dark:border-blue-500",
    "border-green-400 dark:border-green-500",
    "border-purple-400 dark:border-purple-500",
    "border-orange-400 dark:border-orange-500",
    "border-pink-400 dark:border-pink-500",
    "border-teal-400 dark:border-teal-500",
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setReplyLoading(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    } catch {
      // error handled in parent
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={depth > 0 ? `ml-3 pl-2 border-l-2 ${borderColors[(depth - 1) % borderColors.length]}` : ""}>
      <div className="border-b border-gray-200 dark:border-gray-700 p-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1">
            {depth > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                {"↳"}
              </span>
            )}
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">
              {comment.author.name}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {currentUserId && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
              >
                {showReplyForm ? "취소" : "답글"}
              </button>
            )}
            {currentUserId === comment.author.id && (
              <button
                onClick={() => handleDeleteClick(comment.id)}
                disabled={deletingId === comment.id}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition disabled:opacity-50"
              >
                {deletingId === comment.id ? "삭제 중..." : "삭제"}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-tight">
          {comment.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
            /^https?:\/\//.test(part) ? (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
        </p>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-0.5 ml-3 space-y-0.5">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`${comment.author.name}님에게 답글 작성...`}
            rows={2}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 text-xs text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition resize-y leading-tight"
            disabled={replyLoading}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={replyLoading || !replyContent.trim()}
              className="bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {replyLoading ? "작성 중..." : "답글 작성"}
            </button>
          </div>
        </form>
      )}

      {/* Nested replies (recursive) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-0.5 space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
