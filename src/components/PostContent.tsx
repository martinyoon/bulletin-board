"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  const [tooltip, setTooltip] = useState<{ word: string; x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Don't hide tooltip when mouse is over or near the tooltip
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const pad = 50;
      if (
        e.clientX >= rect.left - pad &&
        e.clientX <= rect.right + pad &&
        e.clientY >= rect.top - pad &&
        e.clientY <= rect.bottom + pad
      ) {
        clearTimer();
        return;
      }
    }

    clearTimer();
    setTooltip(null);

    timerRef.current = setTimeout(() => {
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (!range || !range.startContainer.textContent) return;

      const text = range.startContainer.textContent;
      const offset = range.startOffset;

      // Extract word at cursor position (letters, numbers, Korean, Japanese, Chinese only)
      const isWordChar = (ch: string) => /[\p{L}\p{N}]/u.test(ch);
      let start = offset;
      let end = offset;
      while (start > 0 && isWordChar(text[start - 1])) start--;
      while (end < text.length && isWordChar(text[end])) end++;

      const word = text.slice(start, end).trim();
      if (word.length < 2 || /^https?:\/\//.test(word)) return;

      setTooltip({ word, x: e.clientX, y: e.clientY });
    }, 800);
  }, [clearTimer]);

  const handleMouseLeave = useCallback(() => {
    clearTimer();
    setTooltip(null);
  }, [clearTimer]);

  const handleSearch = useCallback(() => {
    if (!tooltip) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(tooltip.word)}`, "_blank");
    setTooltip(null);
  }, [tooltip]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative">
      <div style={{ color: "#CBD5E1" }} className="leading-tight whitespace-pre-wrap">
        {content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
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
      </div>

      {tooltip && (
        <div
          ref={tooltipRef}
          onClick={handleSearch}
          style={{ position: "fixed", left: tooltip.x + 8, top: tooltip.y - 40, cursor: "pointer", backgroundColor: "#282B31", border: "1px solid #3A3D44" }}
          className="z-50 flex items-center gap-3 rounded-xl shadow-lg px-5 py-3 animate-in fade-in hover:opacity-90 transition"
        >
          <span style={{ color: "#CBD5E1" }} className="text-sm font-medium max-w-48 truncate">
            &ldquo;{tooltip.word}&rdquo;
          </span>
          <span style={{ color: "#60A5FA" }} className="flex items-center gap-1.5 text-sm font-semibold">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            검색
          </span>
        </div>
      )}
    </div>
  );
}
