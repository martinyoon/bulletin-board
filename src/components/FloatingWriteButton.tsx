"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

export default function FloatingWriteButton() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [shaking, setShaking] = useState(false);
  const isDragging = useRef(false);
  const wasDragged = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const hiddenRef = useRef(false);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);

  useEffect(() => {
    const clamp = (x: number, y: number) => ({
      x: Math.max(0, Math.min(x, window.innerWidth - 150)),
      y: Math.max(0, Math.min(y, window.innerHeight - 50)),
    });

    const saved = localStorage.getItem("fab-position");
    if (saved) {
      const parsed = JSON.parse(saved);
      const clamped = clamp(parsed.x, parsed.y);
      setPosition(clamped);
      positionRef.current = clamped;
    } else {
      const init = clamp(window.innerWidth - 160, window.innerHeight - 80);
      setPosition(init);
      positionRef.current = init;
    }
    setInitialized(true);

    const onResize = () => {
      const pos = positionRef.current;
      const clamped = clamp(pos.x, pos.y);
      if (clamped.x !== pos.x || clamped.y !== pos.y) {
        setPosition(clamped);
        positionRef.current = clamped;
        localStorage.setItem("fab-position", JSON.stringify(clamped));
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setHidden(detail?.open === true);
    };
    window.addEventListener("comment-form-toggle", handler);
    return () => window.removeEventListener("comment-form-toggle", handler);
  }, []);

  useEffect(() => {
    let shakingNow = false;
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current || hiddenRef.current) return;
      const pos = positionRef.current;
      const cx = pos.x + 65;
      const cy = pos.y + 22;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const near = dx * dx + dy * dy < 6400; // 80px squared
      if (near !== shakingNow) {
        shakingNow = near;
        setShaking(near);
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    wasDragged.current = false;
    setShaking(false);
    dragStart.current = { x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x - positionRef.current.x;
    const dy = e.clientY - dragStart.current.y - positionRef.current.y;
    if (!wasDragged.current && dx * dx + dy * dy < 25) return; // 5px threshold
    wasDragged.current = true;
    const newX = Math.max(0, Math.min(window.innerWidth - 150, e.clientX - dragStart.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragStart.current.y));
    setPosition({ x: newX, y: newY });
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    localStorage.setItem("fab-position", JSON.stringify(positionRef.current));
  }, []);

  const handleClick = useCallback(() => {
    if (wasDragged.current) return;

    const isNewPostPage = pathname === "/posts/new";
    const isEditPostPage = pathname.match(/^\/posts\/[^/]+\/edit$/);

    if (isNewPostPage || isEditPostPage) {
      const form = document.getElementById("post-form") as HTMLFormElement;
      if (form) form.requestSubmit();
    } else {
      router.push("/posts/new");
    }
  }, [pathname, router]);

  if (!session?.user || !initialized || hidden) return null;

  const isNewPostPage = pathname === "/posts/new";
  const isEditPostPage = pathname.match(/^\/posts\/[^/]+\/edit$/);
  const isFormPage = isNewPostPage || isEditPostPage;

  const bgColor = isFormPage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700";
  const label = isFormPage ? (isNewPostPage ? "새글 쓰기 작성완료" : "수정 완료") : "게시판 새글 쓰기";
  const iconPath = isFormPage ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4";

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        touchAction: "none",
        zIndex: 50,
        animation: shaking ? "fab-sway 2s ease-in-out infinite" : "none",
      }}
      className={`flex items-center gap-2 rounded-full ${bgColor} px-6 py-3 text-sm font-semibold text-white shadow-lg cursor-grab active:cursor-grabbing select-none transition-colors focus:outline-none`}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
      {label}
    </div>
  );
}
