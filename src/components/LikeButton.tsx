"use client";

import { useState, useEffect, useRef } from "react";

interface LikeButtonProps {
  postId: string;
  isLoggedIn: boolean;
}

interface Particle {
  id: number;
  emoji: string;
  angle: number;
  dist: number;
}

export default function LikeButton({ postId, isLoggedIn }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [isDisliked, setIsDisliked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likeParticles, setLikeParticles] = useState<Particle[]>([]);
  const [dislikeParticles, setDislikeParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);

  const spawnParticles = () => {
    const emojis = ["❤️", "🌟", "✨", "🎉", "🎊", "💖", "⭐", "🥳", "💫", "🔥", "💕", "🍀"];
    const ps = Array.from({ length: 16 }, () => ({
      id: particleId.current++,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      angle: Math.random() * 360,
      dist: 60 + Math.random() * 80,
    }));
    setLikeParticles(ps);
    setTimeout(() => setLikeParticles([]), 1200);
  };

  const spawnSadParticles = () => {
    const emojis = ["🖤", "🕳️", "⬛", "💀", "☠️", "🕶️", "♠️", "♣️", "⚫", "🌑", "🏴", "⛓️", "🪦", "◼️", "▪️", "🐾"];
    const ps = Array.from({ length: 16 }, () => ({
      id: particleId.current++,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      angle: Math.random() * 360,
      dist: 60 + Math.random() * 80,
    }));
    setDislikeParticles(ps);
    setTimeout(() => setDislikeParticles([]), 1200);
  };

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
    if (!isLiked) spawnParticles();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
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
    if (!isDisliked) spawnSadParticles();
    setIsDisliked(!isDisliked);
    setDislikeCount(isDisliked ? dislikeCount - 1 : dislikeCount + 1);
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
      {/* 추천 버튼 */}
      <div className="relative">
        <button
          onClick={handleToggleLike}
          disabled={loading}
          style={isLiked ? { borderColor: "#7F1D1D", backgroundColor: "rgba(239,68,68,0.1)", color: "#F87171" } : { borderColor: "#3A3D44", backgroundColor: "#282B31", color: "#CBD5E1" }}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 hover:opacity-80"
        >
          <span className="text-base">👍</span>
          추천 {likeCount > 0 && likeCount}
        </button>
        {likeParticles.map((p) => (
          <span
            key={p.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              fontSize: "1.2rem",
              pointerEvents: "none",
              animation: "like-burst 1s ease-out forwards",
              ["--angle" as string]: `${p.angle}deg`,
              ["--dist" as string]: `${p.dist}px`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* 비추천 버튼 */}
      <div className="relative">
        <button
          onClick={handleToggleDislike}
          disabled={loading}
          style={isDisliked ? { borderColor: "#1E3A5F", backgroundColor: "rgba(59,130,246,0.1)", color: "#60A5FA" } : { borderColor: "#3A3D44", backgroundColor: "#282B31", color: "#CBD5E1" }}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 hover:opacity-80"
        >
          <span className="text-base">👎</span>
          비추천 {dislikeCount > 0 && dislikeCount}
        </button>
        {dislikeParticles.map((p) => (
          <span
            key={p.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              fontSize: "1.2rem",
              pointerEvents: "none",
              animation: "like-burst 1s ease-out forwards",
              ["--angle" as string]: `${p.angle}deg`,
              ["--dist" as string]: `${p.dist}px`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
