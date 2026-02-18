import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReadAwarePostList from "@/components/ReadAwarePostList";

export default async function PostListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page, search } = await searchParams;
  const session = await auth();

  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const pageSize = 10;
  const searchQuery = (search || "").trim();

  const where = searchQuery
    ? {
        OR: [
          { title: { contains: searchQuery } },
          { content: { contains: searchQuery } },
        ],
      }
    : {};

  const [totalCount, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" as const },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { comments: true, likes: true, dislikes: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div style={{ backgroundColor: "#1F2126" }} className="min-h-screen">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Header */}
        <div className="mb-1">
          <h1 style={{ color: "#E5E7EB" }} className="text-2xl font-bold leading-tight">게시판 새글</h1>
        </div>

        {/* Search bar */}
        <form method="GET" action="/posts" className="mb-1">
          <div className="flex gap-1">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="검색어를 입력하세요..."
              style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
              className="flex-1 rounded-lg border px-2 py-1.5 text-sm placeholder-[#64748B] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition leading-tight"
            />
            <button
              type="submit"
              style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
              className="rounded-lg border px-3 py-1.5 text-sm font-semibold hover:opacity-80 transition focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              검색
            </button>
          </div>
        </form>
        <p style={{ color: "#64748B" }} className="text-xs mb-1 leading-tight">💡 ↑↓ 키로 이전 검색어를 불러올 수 있어요</p>

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="py-8 text-center">
            <style>{`@keyframes curious-wobble{0%,50%,100%{transform:translateY(0) rotate(0deg)}5%{transform:translateY(-14px) rotate(-8deg)}10%{transform:translateY(0) rotate(0deg)}15%{transform:translateY(-10px) rotate(6deg)}20%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-5px) rotate(-3deg)}30%{transform:translateY(0) rotate(0deg)}}`}</style>
            {searchQuery ? (
              <img src="/curious-icon.jpg" alt="검색 결과 없음" width={80} height={80} className="mx-auto mb-2 rounded-full" style={{ animation: "curious-wobble 3s ease-in-out infinite" }} />
            ) : (
              <div className="text-5xl mb-2">📝</div>
            )}
            <p style={{ color: "#94A3B8" }} className="leading-tight">
              {searchQuery
                ? <><span style={{ color: "#60A5FA" }} className="font-bold">&ldquo;{searchQuery}&rdquo;</span>에 대한 검색 결과가 없습니다.</>
                : "첫 글을 작성해보세요!"}
            </p>
          </div>
        ) : (
          <ReadAwarePostList posts={JSON.parse(JSON.stringify(posts))} currentPage={currentPage} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (() => {
          const groupSize = 5;
          const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
          const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
          const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);
          const searchSuffix = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

          return (
            <div className="mt-1 flex items-center justify-center gap-1">
              {groupStart > 1 ? (
                <Link
                  href={`/posts?page=${groupStart - 1}${searchSuffix}`}
                  style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-80 transition"
                >
                  이전
                </Link>
              ) : (
                <span style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#64748B" }} className="rounded-lg border px-3 py-1.5 text-sm font-medium cursor-not-allowed">
                  이전
                </span>
              )}

              {pages.map((p) => (
                p === currentPage ? (
                  <span
                    key={p}
                    style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
                    className="rounded-lg px-3 py-1.5 text-sm font-bold"
                  >
                    {p}
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={`/posts?page=${p}${searchSuffix}`}
                    style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
                    className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-80 transition"
                  >
                    {p}
                  </Link>
                )
              ))}

              {groupEnd < totalPages ? (
                <Link
                  href={`/posts?page=${groupEnd + 1}${searchSuffix}`}
                  style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-80 transition"
                >
                  다음
                </Link>
              ) : (
                <span style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#64748B" }} className="rounded-lg border px-3 py-1.5 text-sm font-medium cursor-not-allowed">
                  다음
                </span>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
