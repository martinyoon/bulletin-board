import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AuthorLink from "@/components/AuthorLink";

function formatRelativeTime(dateString: string | Date) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

function getAvatarInitial(name: string) {
  return name[0];
}

export default async function BestPostListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page, search } = await searchParams;
  const session = await auth();

  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const pageSize = 10;
  const searchQuery = search || "";

  const where = {
    likes: { some: {} },
    ...(searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery } },
            { content: { contains: searchQuery } },
          ],
        }
      : {}),
  };

  const [totalCount, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { likes: { _count: "desc" as const } },
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
          <h1 style={{ color: "#60A5FA" }} className="text-2xl font-bold leading-tight">베스트글 게시판</h1>
        </div>

        {/* Search bar */}
        <form method="GET" action="/posts/best" className="mb-1">
          <div className="flex gap-1">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="베스트글 검색..."
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

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-5xl mb-2">{searchQuery ? "🔍" : "🔥"}</div>
            <p style={{ color: "#94A3B8" }} className="leading-tight">
              {searchQuery
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : "아직 베스트글이 없습니다!"}
            </p>
            {!searchQuery && (
              <p style={{ color: "#64748B" }} className="text-sm mt-0.5">추천을 1개 이상 받은 글이 여기에 표시됩니다.</p>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                style={{ borderBottom: "1px solid #3A3D44" }}
                className="block py-1.5 px-1 hover:bg-[#282B31] transition group relative border-l-4 border-l-transparent hover:border-l-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 style={{ color: "#E5E7EB" }} className="text-lg font-semibold group-hover:text-blue-400 transition leading-tight flex items-center">
                      <span className="truncate">{post.title}</span>
                      {post._count.comments > 0 && (
                        <span style={{ color: "#F59E0B" }} className="ml-1 text-sm font-bold shrink-0">[{post._count.comments}]</span>
                      )}
                    </h2>
                    <div style={{ color: "#94A3B8" }} className="mt-0.5 flex items-center gap-1 text-sm leading-tight">
                      <span className="flex items-center gap-1">
                        <span style={{ backgroundColor: "#3A3D44", color: "#CBD5E1" }} className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold">
                          {getAvatarInitial(post.author.name)}
                        </span>
                        <AuthorLink href={`/users/${post.author.id}`} style={{ color: "#94A3B8" }} className="hover:text-blue-400 hover:underline">{post.author.name}</AuthorLink>
                      </span>
                      <span>{formatRelativeTime(post.createdAt)}</span>
                      <span className="flex items-center gap-0.5">
                        <span className="text-xs">👍</span>
                        {post._count.likes}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="text-xs">👎</span>
                        {post._count.dislikes}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
                  href={`/posts/best?page=${groupStart - 1}${searchSuffix}`}
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
                    href={`/posts/best?page=${p}${searchSuffix}`}
                    style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
                    className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-80 transition"
                  >
                    {p}
                  </Link>
                )
              ))}

              {groupEnd < totalPages ? (
                <Link
                  href={`/posts/best?page=${groupEnd + 1}${searchSuffix}`}
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
