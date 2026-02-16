import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import PostForm from "@/components/PostForm";

export default async function NewPostPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Back link */}
        <Link
          href="/posts"
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
          목록으로 돌아가기
        </Link>

        <div className="p-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">새 글 작성</h1>
          <PostForm mode="create" />
        </div>
      </div>
    </div>
  );
}
