import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // 받은 총 추천 수
  const totalLikes = await prisma.like.count({
    where: { post: { authorId: id } },
  });

  // 최근 게시글 5개
  const recentPosts = await prisma.post.findMany({
    where: { authorId: id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { comments: true, likes: true } },
    },
  });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return formatDate(date);
  };

  return (
    <div style={{ backgroundColor: "#1F2126" }} className="min-h-screen">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Back link */}
        <Link
          href="/posts"
          style={{ color: "#94A3B8" }}
          className="inline-flex items-center gap-1 text-sm hover:opacity-80 transition mb-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          게시판으로 돌아가기
        </Link>

        {/* Profile card */}
        <div style={{ borderBottom: "1px solid #3A3D44" }} className="pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
              className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold"
            >
              {user.name[0]}
            </div>
            <div>
              <h1 style={{ color: "#E5E7EB" }} className="text-xl font-bold leading-tight">
                {user.name}
              </h1>
              <p style={{ color: "#64748B" }} className="text-sm leading-tight">
                가입일: {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-3">
          <div style={{ backgroundColor: "#282B31", borderColor: "#3A3D44" }} className="flex-1 border rounded-lg p-3 text-center">
            <div style={{ color: "#E5E7EB" }} className="text-lg font-bold">{user._count.posts}</div>
            <div style={{ color: "#94A3B8" }} className="text-xs">게시글</div>
          </div>
          <div style={{ backgroundColor: "#282B31", borderColor: "#3A3D44" }} className="flex-1 border rounded-lg p-3 text-center">
            <div style={{ color: "#E5E7EB" }} className="text-lg font-bold">{user._count.comments}</div>
            <div style={{ color: "#94A3B8" }} className="text-xs">댓글</div>
          </div>
          <div style={{ backgroundColor: "#282B31", borderColor: "#3A3D44" }} className="flex-1 border rounded-lg p-3 text-center">
            <div style={{ color: "#E5E7EB" }} className="text-lg font-bold">{totalLikes}</div>
            <div style={{ color: "#94A3B8" }} className="text-xs">받은 추천</div>
          </div>
        </div>

        {/* Recent posts */}
        <div>
          <h2 style={{ color: "#CBD5E1" }} className="text-sm font-bold mb-1">최근 게시글</h2>
          {recentPosts.length === 0 ? (
            <p style={{ color: "#64748B" }} className="text-sm py-2">작성한 게시글이 없습니다.</p>
          ) : (
            <div className="space-y-0">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  style={{ borderBottom: "1px solid #3A3D44" }}
                  className="block py-1.5 px-1 hover:bg-[#282B31] transition border-l-4 border-l-transparent hover:border-l-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: "#E5E7EB" }} className="flex items-center flex-1 min-w-0 text-sm font-semibold">
                      <span className="truncate">{post.title}</span>
                      {post._count.comments > 0 && (
                        <span style={{ color: "#F59E0B" }} className="ml-1 font-bold shrink-0">[{post._count.comments}]</span>
                      )}
                    </span>
                    <span style={{ color: "#64748B" }} className="flex items-center gap-1.5 text-xs ml-2 shrink-0">
                      <span className="flex items-center gap-0.5">
                        <span className="text-[10px]">👍</span>
                        {post._count.likes}
                      </span>
                      <span>{formatRelativeTime(post.createdAt)}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
