"use client";

import { useState, useEffect } from "react";

interface LikeButtonProps {
  postId: string;
  isLoggedIn: boolean;
}

export default function LikeButton({ postId, isLoggedIn }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [isDisliked, setIsDisliked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${postId}/like`).then((r) => r.json()),
      fetch(`/api/posts/${postId}/dislike`).then((r) => r.json()),
    ])
      .then(([likeData, dislikeData]) => {
        setLikeCount(likeData.likeCount);
        setIsLiked(likeData.isLiked);
        setDislikeCount(dislikeData.dislikeCount);
        setIsDisliked(dislikeData.isDisliked);
      })
      .catch(() => {});
  }, [postId]);

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (loading) return;
    setLoading(true);

    const prevLiked = isLiked;
    const prevLikeCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    // 추천 시 비추천 해제
    if (!isLiked && isDisliked) {
      setIsDisliked(false);
      setDislikeCount(dislikeCount - 1);
    }

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.likeCount);
        setIsLiked(data.isLiked);
        // 서버에서 비추천 상태도 갱신
        const dRes = await fetch(`/api/posts/${postId}/dislike`);
        if (dRes.ok) {
          const dData = await dRes.json();
          setDislikeCount(dData.dislikeCount);
          setIsDisliked(dData.isDisliked);
        }
      } else {
        setIsLiked(prevLiked);
        setLikeCount(prevLikeCount);
      }
    } catch {
      setIsLiked(prevLiked);
      setLikeCount(prevLikeCount);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDislike = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (loading) return;
    setLoading(true);

    const prevDisliked = isDisliked;
    const prevDislikeCount = dislikeCount;
    setIsDisliked(!isDisliked);
    setDislikeCount(isDisliked ? dislikeCount - 1 : dislikeCount + 1);
    // 비추천 시 추천 해제
    if (!isDisliked && isLiked) {
      setIsLiked(false);
      setLikeCount(likeCount - 1);
    }

    try {
      const res = await fetch(`/api/posts/${postId}/dislike`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDislikeCount(data.dislikeCount);
        setIsDisliked(data.isDisliked);
        // 서버에서 추천 상태도 갱신
        const lRes = await fetch(`/api/posts/${postId}/like`);
        if (lRes.ok) {
          const lData = await lRes.json();
          setLikeCount(lData.likeCount);
          setIsLiked(lData.isLiked);
        }
      } else {
        setIsDisliked(prevDisliked);
        setDislikeCount(prevDislikeCount);
      }
    } catch {
      setIsDisliked(prevDisliked);
      setDislikeCount(prevDislikeCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleLike}
        disabled={loading}
        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
          isLiked
            ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <svg
          className="h-5 w-5"
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        추천 {likeCount > 0 && likeCount}
      </button>

      <button
        onClick={handleToggleDislike}
        disabled={loading}
        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
          isDisliked
            ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <svg
          className="h-5 w-5"
          fill={isDisliked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.694 0-1.372.271-1.873.744L3.342 5.65a2.252 2.252 0 00-.083 3.16l.012.013c.104.12.183.258.231.408l.07.222a3.252 3.252 0 002.287 2.282c.2.055.406.092.616.11l.455.04c.512.045.898.476.898.99v2.07a2.25 2.25 0 01-1.5 2.122"
          />
        </svg>
        비추천 {dislikeCount > 0 && dislikeCount}
      </button>
    </div>
  );
}
