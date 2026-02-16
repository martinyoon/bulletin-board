import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PostForm from "@/components/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  if (!post) {
    notFound();
  }

  if (post.author.id !== session.user.id) {
    redirect(`/posts/${id}`);
  }

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Back link */}
        <Link
          href={`/posts/${id}`}
          className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition mb-1"
        >
          <svg
            className="h-3.5 w-3.5"
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
          돌아가기
        </Link>

        <div className="p-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">게시글 수정</h1>
          <PostForm
            mode="edit"
            postId={id}
            initialTitle={post.title}
            initialContent={post.content}
          />
        </div>
      </div>
    </div>
  );
}
