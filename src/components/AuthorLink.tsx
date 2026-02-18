"use client";

import { useRouter } from "next/navigation";

export default function AuthorLink({
  href,
  children,
  className,
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();
  return (
    <span
      role="link"
      tabIndex={0}
      style={{ cursor: "pointer", ...style }}
      className={className}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(href); }}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); router.push(href); } }}
    >
      {children}
    </span>
  );
}
