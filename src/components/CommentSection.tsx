"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const router = useRouter();
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
      window.dispatchEvent(new CustomEvent("comment-form-toggle", { detail: { open: false } }));
      await fetchComments();
      router.refresh();
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
    router.refresh();
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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  return (
    <div className="mt-1">
      <h3 style={{ color: "#E5E7EB" }} className="text-base font-semibold mb-1 leading-tight">
        댓글 ({totalCount})
      </h3>

      {error && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "#7F1D1D", color: "#F87171" }} className="p-1 text-xs border-b mb-0.5 leading-tight">
          {error}
        </div>
      )}

      {/* Comment list */}
      <div className="space-y-0 mb-1">
        {comments.length === 0 ? (
          <p style={{ color: "#94A3B8" }} className="text-xs py-1 leading-tight">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
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
            onFocus={() => window.dispatchEvent(new CustomEvent("comment-form-toggle", { detail: { open: true } }))}
            placeholder="댓글을 작성하세요..."
            rows={2}
            style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
            className="w-full border px-2 py-1 text-xs placeholder-[#64748B] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition resize-y leading-tight"
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
        <p style={{ color: "#94A3B8", borderColor: "#3A3D44" }} className="text-xs text-center py-1 border-b border-dashed leading-tight">
          댓글을 작성하려면{" "}
          <a href="/login" style={{ color: "#60A5FA" }} className="hover:underline font-medium">
            로그인
          </a>
          해주세요.
        </p>
      )}
    </div>
  );
}

/* ─── 개별 댓글 컴포넌트 (재귀) ─── */

interface Particle {
  id: number;
  emoji: string;
  angle: number;
  dist: number;
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  onReply,
  onDelete,
  depth,
  parentAuthorName,
  parentAuthorId,
}: {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth: number;
  parentAuthorName?: string;
  parentAuthorId?: string;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 추천/비추천 상태
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [isDisliked, setIsDisliked] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [likeParticles, setLikeParticles] = useState<Particle[]>([]);
  const [dislikeParticles, setDislikeParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);

  // 깊이별 세로선 색상 (블루 계열 단색)
  const borderColors = [
    "border-blue-500/50",
    "border-blue-500/40",
    "border-blue-500/30",
    "border-blue-400/25",
    "border-blue-400/20",
    "border-blue-400/15",
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

  // 추천/비추천 상태 조회
  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${postId}/comments/${comment.id}/like`).then((r) => r.json()),
      fetch(`/api/posts/${postId}/comments/${comment.id}/dislike`).then((r) => r.json()),
    ])
      .then(([likeData, dislikeData]) => {
        setLikeCount(likeData.likeCount);
        setIsLiked(likeData.isLiked);
        setDislikeCount(dislikeData.dislikeCount);
        setIsDisliked(dislikeData.isDisliked);
      })
      .catch(() => {});
  }, [postId, comment.id]);

  const spawnLikeParticles = () => {
    const emojis = ["❤️", "🌟", "✨", "🎉", "💖", "⭐", "💫", "🔥", "💕"];
    const ps = Array.from({ length: 10 }, () => ({
      id: particleId.current++,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      angle: Math.random() * 360,
      dist: 30 + Math.random() * 50,
    }));
    setLikeParticles(ps);
    setTimeout(() => setLikeParticles([]), 1000);
  };

  const spawnDislikeParticles = () => {
    const emojis = ["🖤", "💀", "☠️", "⚫", "🌑", "♠️", "⬛", "🪦", "⛓️"];
    const ps = Array.from({ length: 10 }, () => ({
      id: particleId.current++,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      angle: Math.random() * 360,
      dist: 30 + Math.random() * 50,
    }));
    setDislikeParticles(ps);
    setTimeout(() => setDislikeParticles([]), 1000);
  };

  const handleLike = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (voteLoading) return;
    setVoteLoading(true);

    if (!isLiked) spawnLikeParticles();
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (!isLiked && isDisliked) {
      setIsDisliked(false);
      setDislikeCount(dislikeCount - 1);
    }

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.likeCount);
        setIsLiked(data.isLiked);
        const dRes = await fetch(`/api/posts/${postId}/comments/${comment.id}/dislike`);
        if (dRes.ok) {
          const dData = await dRes.json();
          setDislikeCount(dData.dislikeCount);
          setIsDisliked(dData.isDisliked);
        }
      } else {
        setIsLiked(prevLiked);
        setLikeCount(prevCount);
      }
    } catch {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (voteLoading) return;
    setVoteLoading(true);

    if (!isDisliked) spawnDislikeParticles();
    const prevDisliked = isDisliked;
    const prevCount = dislikeCount;
    setIsDisliked(!isDisliked);
    setDislikeCount(isDisliked ? dislikeCount - 1 : dislikeCount + 1);
    if (!isDisliked && isLiked) {
      setIsLiked(false);
      setLikeCount(likeCount - 1);
    }

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}/dislike`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDislikeCount(data.dislikeCount);
        setIsDisliked(data.isDisliked);
        const lRes = await fetch(`/api/posts/${postId}/comments/${comment.id}/like`);
        if (lRes.ok) {
          const lData = await lRes.json();
          setLikeCount(lData.likeCount);
          setIsLiked(lData.isLiked);
        }
      } else {
        setIsDisliked(prevDisliked);
        setDislikeCount(prevCount);
      }
    } catch {
      setIsDisliked(prevDisliked);
      setDislikeCount(prevCount);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setReplyLoading(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
      window.dispatchEvent(new CustomEvent("comment-form-toggle", { detail: { open: false } }));
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

  const renderParticles = (particles: Particle[]) =>
    particles.map((p) => (
      <span
        key={p.id}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          fontSize: "0.75rem",
          pointerEvents: "none",
          animation: "like-burst 0.8s ease-out forwards",
          ["--angle" as string]: `${p.angle}deg`,
          ["--dist" as string]: `${p.dist}px`,
        }}
      >
        {p.emoji}
      </span>
    ));

  return (
    <div className={depth > 0 ? `ml-3 pl-2 border-l-2 ${borderColors[(depth - 1) % borderColors.length]}` : ""}>
      <div style={{ borderBottom: "1px solid #3A3D44" }} className="p-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1">
            {depth > 0 && (
              <span style={{ color: "#64748B" }} className="text-xs font-mono">
                {"↳"}
              </span>
            )}
            <Link href={`/users/${comment.author.id}`} style={{ color: "#E5E7EB" }} className="text-xs font-semibold leading-tight hover:text-blue-400 hover:underline">
              {comment.author.name}
            </Link>
            <span style={{ color: "#64748B" }} className="text-[11px] leading-tight">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {currentUserId && (
              <button
                onClick={() => {
                  const next = !showReplyForm;
                  setShowReplyForm(next);
                  window.dispatchEvent(new CustomEvent("comment-form-toggle", { detail: { open: next } }));
                }}
                style={{ color: "#60A5FA" }}
                className="text-xs hover:opacity-80 transition"
              >
                {showReplyForm ? "취소" : "답글"}
              </button>
            )}
            {currentUserId === comment.author.id && (
              <button
                onClick={() => handleDeleteClick(comment.id)}
                disabled={deletingId === comment.id}
                style={{ color: "#F87171" }}
                className="text-xs hover:opacity-80 transition disabled:opacity-50"
              >
                {deletingId === comment.id ? "삭제 중..." : "삭제"}
              </button>
            )}
          </div>
        </div>
        <p style={{ color: "#CBD5E1" }} className="text-xs whitespace-pre-wrap leading-tight">
          {depth > 0 && parentAuthorName && parentAuthorId && (
            <Link href={`/users/${parentAuthorId}`} style={{ color: "#6366F1" }} className="font-semibold mr-1 hover:underline">@{parentAuthorName}</Link>
          )}
          {comment.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
            /^https?:\/\//.test(part) ? (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#60A5FA" }}
                className="hover:underline break-all"
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
        </p>

        {/* 댓글 추천/비추천 버튼 */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="relative">
            <button
              onClick={handleLike}
              disabled={voteLoading}
              style={isLiked ? { borderColor: "#7F1D1D", backgroundColor: "rgba(239,68,68,0.1)", color: "#F87171" } : { borderColor: "#3A3D44", color: "#64748B" }}
              className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded border transition disabled:opacity-50 hover:text-red-400"
            >
              <svg className="h-3 w-3" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H6.633" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 21V10.5" />
              </svg>
              {likeCount}
            </button>
            {renderParticles(likeParticles)}
          </div>
          <div className="relative">
            <button
              onClick={handleDislike}
              disabled={voteLoading}
              style={isDisliked ? { borderColor: "#1E3A5F", backgroundColor: "rgba(59,130,246,0.1)", color: "#60A5FA" } : { borderColor: "#3A3D44", color: "#64748B" }}
              className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded border transition disabled:opacity-50 hover:text-blue-400"
            >
              <svg className="h-3 w-3" fill={isDisliked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.367 13.75c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 0 0-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 1-.322 1.672v.633a.75.75 0 0 0-.75.75 2.25 2.25 0 0 0-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.372c-1.026 0-1.945-.694-2.054-1.715A11.95 11.95 0 0 1 1.25 12.25c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729h4.227c.483 0 .964.078 1.423.23l3.114 1.04c.459.153.94.23 1.423.23h2.27" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 3v10.5" />
              </svg>
              {dislikeCount}
            </button>
            {renderParticles(dislikeParticles)}
          </div>
        </div>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-0.5 ml-3 space-y-0.5">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`${comment.author.name}님에게 답글 작성...`}
            rows={2}
            style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
            className="w-full border px-2 py-1 text-xs placeholder-[#64748B] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition resize-y leading-tight"
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
              postId={postId}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
              parentAuthorName={comment.author.name}
              parentAuthorId={comment.author.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
