import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SuperBestPostListPage() {
  const posts = await prisma.post.findMany({
    where: { likes: { some: {} } },
    orderBy: { likes: { _count: "desc" as const } },
    take: 5,
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { comments: true, likes: true, dislikes: true } },
    },
  });

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Header */}
        <div className="mb-1">
          <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400 leading-tight">슈퍼베스트글 게시판</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">추천을 가장 많이 받은 TOP 5</p>
        </div>

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="py-2 text-center">
            <p className="text-gray-500 dark:text-gray-400 leading-tight">
              아직 슈퍼베스트글이 없습니다. 추천을 1개 이상 받은 글이 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block border-b border-gray-200 dark:border-gray-800 py-1.5 px-1 hover:bg-gray-50 dark:hover:bg-gray-900 transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate leading-tight">
                      <span className={`inline-block w-7 text-center mr-1 text-sm font-bold rounded ${index < 3 ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-500"}`}>
                        {index + 1}
                      </span>
                      {post.title}
                    </h2>
                    <div className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 leading-tight ml-8">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {post.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(post.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        추천 {post._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.694 0-1.372.271-1.873.744L3.342 5.65a2.252 2.252 0 00-.083 3.16l.012.013c.104.12.183.258.231.408l.07.222a3.252 3.252 0 002.287 2.282c.2.055.406.092.616.11l.455.04c.512.045.898.476.898.99v2.07a2.25 2.25 0 01-1.5 2.122" />
                        </svg>
                        비추천 {post._count.dislikes}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        댓글 {post._count.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
