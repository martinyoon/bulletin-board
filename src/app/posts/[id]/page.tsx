import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CommentSection from "@/components/CommentSection";
import DeletePostButton from "@/components/DeletePostButton";
import LikeButton from "@/components/LikeButton";
import PostContent from "@/components/PostContent";
import BottomPostList from "@/components/BottomPostList";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  if (!post) {
    notFound();
  }

  // Fetch post list for bottom section
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: { select: { name: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  const isAuthor = session?.user?.id === post.author.id;

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Back link */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition mb-1"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로 돌아가기
        </Link>

        {/* Post content */}
        <article className="bg-white dark:bg-gray-950 p-2">
          {/* Post header */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-1 mb-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 leading-tight">
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  작성자: {post.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  작성일: {formatDate(post.createdAt)}
                </span>
              </div>

              {/* Author actions */}
              {isAuthor && (
                <div className="flex items-center gap-1">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus:ring-2 focus:ring-gray-200 focus:outline-none"
                  >
                    수정
                  </Link>
                  <DeletePostButton postId={post.id} />
                </div>
              )}
            </div>
          </div>

          {/* Post body */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <PostContent content={post.content} />
          </div>

          {/* Like button */}
          <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-800 flex justify-center">
            <LikeButton postId={post.id} isLoggedIn={!!session?.user} />
          </div>
        </article>

        {/* Comments section */}
        <div className="mt-1 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2">
          <CommentSection
            postId={post.id}
            currentUserId={session?.user?.id}
          />
        </div>

        {/* Post list at bottom */}
        <BottomPostList posts={JSON.parse(JSON.stringify(posts))} currentPostId={post.id} />
      </div>
    </div>
  );
}
