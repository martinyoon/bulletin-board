import Link from "next/link";
import { prisma } from "@/lib/prisma";

const RANK_STYLES = [
  { emoji: "\uD83D\uDC51", border: "#60A5FA", bg: "rgba(59,130,246,0.15)" },
  { emoji: "\uD83E\uDD48", border: "#94A3B8", bg: "rgba(148,163,184,0.10)" },
  { emoji: "\uD83E\uDD49", border: "#60A5FA", bg: "rgba(59,130,246,0.08)" },
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

function getAvatarInitial(name: string) {
  return name[0];
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
    <div style={{ backgroundColor: "#1F2126" }} className="min-h-screen">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Header */}
        <div className="mb-1">
          <h1 style={{ color: "#3B82F6" }} className="text-2xl font-bold leading-tight">슈퍼베스트글 게시판</h1>
          <p style={{ color: "#94A3B8" }} className="text-sm leading-tight">추천을 가장 많이 받은 TOP 5</p>
        </div>

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-5xl mb-2">🏆</div>
            <p style={{ color: "#94A3B8" }} className="leading-tight">
              아직 왕좌가 비어있습니다!
            </p>
            <p style={{ color: "#64748B" }} className="text-sm mt-0.5">추천을 1개 이상 받은 글이 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post, index) => {
              const rankStyle = RANK_STYLES[index];
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block py-1.5 px-1 transition group relative overflow-hidden"
                  style={{
                    borderBottom: "1px solid #3A3D44",
                    borderLeft: rankStyle ? `4px solid ${rankStyle.border}` : "4px solid transparent",
                    backgroundColor: rankStyle ? rankStyle.bg : "transparent",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 style={{ color: "#E5E7EB" }} className="text-lg font-semibold group-hover:text-blue-400 transition leading-tight flex items-center">
                        <span className="inline-block w-8 text-center mr-1 shrink-0">
                          {rankStyle ? rankStyle.emoji : <span style={{ color: "#64748B" }} className="text-sm">{index + 1}</span>}
                        </span>
                        <span className="truncate">{post.title}</span>
                        {post._count.comments > 0 && (
                          <span style={{ color: "#F59E0B" }} className="ml-1 text-sm font-bold shrink-0">[{post._count.comments}]</span>
                        )}
                      </h2>
                      <div style={{ color: "#94A3B8" }} className="mt-0.5 flex items-center gap-1 text-sm leading-tight ml-9">
                        <span className="flex items-center gap-1">
                          <span style={{ backgroundColor: "#3A3D44", color: "#CBD5E1" }} className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold">
                            {getAvatarInitial(post.author.name)}
                          </span>
                          <Link href={`/users/${post.author.id}`} style={{ color: "#94A3B8" }} className="hover:text-blue-400 hover:underline">{post.author.name}</Link>
                        </span>
                        <span>{formatRelativeTime(post.createdAt)}</span>
                        <span className="flex items-center gap-0.5">
                          <span className="text-xs">👍</span>
                          {post._count.likes}
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
