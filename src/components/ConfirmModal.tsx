"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        style={{ backgroundColor: "#282B31", border: "1px solid #3A3D44" }}
        className="rounded-lg p-4 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: "#E5E7EB" }} className="text-base font-bold mb-1">
          {title}
        </h3>
        <p style={{ color: "#94A3B8" }} className="text-sm mb-4 whitespace-pre-wrap">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            style={{ borderColor: "#3A3D44", color: "#CBD5E1" }}
            className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-[#3A3D44] transition"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            style={
              danger
                ? { backgroundColor: "#DC2626", color: "#FFFFFF" }
                : { backgroundColor: "#3B82F6", color: "#FFFFFF" }
            }
            className="rounded-lg px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
