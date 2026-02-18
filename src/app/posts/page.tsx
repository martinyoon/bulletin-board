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
  const searchQuery = search || "";

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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Header */}
        <div className="mb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">세상의모든것-댓글달기-게시판</h1>
        </div>

        {/* Search bar */}
        <form method="GET" action="/posts" className="mb-1">
          <div className="flex gap-1">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="검색어를 입력하세요..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition leading-tight"
            />
            <button
              type="submit"
              className="rounded-lg bg-gray-800 dark:bg-gray-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-900 dark:hover:bg-gray-600 transition focus:ring-2 focus:ring-gray-500/20 focus:outline-none"
            >
              검색
            </button>
          </div>
        </form>

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-5xl mb-2">{searchQuery ? "🔍" : "📝"}</div>
            <p className="text-gray-500 dark:text-gray-400 leading-tight">
              {searchQuery
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : "첫 글을 작성해보세요!"}
            </p>
          </div>
        ) : (
          <ReadAwarePostList posts={JSON.parse(JSON.stringify(posts))} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-1 flex items-center justify-center gap-1">
            {currentPage > 1 ? (
              <Link
                href={`/posts?page=${currentPage - 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                이전
              </Link>
            ) : (
              <span className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed">
                이전
              </span>
            )}

            <span className="px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 leading-tight">
              {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={`/posts?page=${currentPage + 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                다음
              </Link>
            ) : (
              <span className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed">
                다음
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
