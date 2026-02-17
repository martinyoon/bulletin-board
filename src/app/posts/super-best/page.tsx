import Link from "next/link";
import { prisma } from "@/lib/prisma";

const RANK_STYLES = [
  { emoji: "\uD83D\uDC51", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700" },
  { emoji: "\uD83E\uDD48", bg: "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600" },
  { emoji: "\uD83E\uDD49", bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700" },
];

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

const AVATAR_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
];

function getAvatarColor(name: string) {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

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
          <div className="py-8 text-center">
            <div className="text-5xl mb-2">🏆</div>
            <p className="text-gray-500 dark:text-gray-400 leading-tight">
              아직 왕좌가 비어있습니다!
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">추천을 1개 이상 받은 글이 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post, index) => {
              const rankStyle = RANK_STYLES[index];
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className={`block border-b py-1.5 px-1 transition group relative overflow-hidden ${
                    rankStyle
                      ? `${rankStyle.bg} border`
                      : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                  style={{ borderLeft: rankStyle ? "4px solid" : undefined, borderLeftColor: index === 0 ? "#eab308" : index === 1 ? "#9ca3af" : index === 2 ? "#f97316" : undefined }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate leading-tight">
                        <span className="inline-block w-8 text-center mr-1">
                          {rankStyle ? rankStyle.emoji : <span className="text-sm text-gray-400">{index + 1}</span>}
                        </span>
                        {post.title}
                      </h2>
                      <div className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 leading-tight ml-9">
                        <span className="flex items-center gap-1">
                          <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white ${getAvatarColor(post.author.name)}`}>
                            {post.author.name[0]}
                          </span>
                          {post.author.name}
                        </span>
                        <span>{formatRelativeTime(post.createdAt)}</span>
                        <span className="flex items-center gap-0.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post._count.likes}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          {post._count.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
