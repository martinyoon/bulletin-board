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
    <div style={{ backgroundColor: "#1F2126" }} className="min-h-screen">
      <div className="mx-auto max-w-5xl px-2 py-2">
        {/* Back link */}
        <Link
          href="/posts"
          style={{ color: "#94A3B8" }}
          className="inline-flex items-center gap-1 text-xs hover:text-blue-400 transition mb-1"
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
          <h1 style={{ color: "#E5E7EB" }} className="text-xl font-bold mb-1 leading-tight">새 글 작성</h1>
          <PostForm mode="create" />
        </div>
      </div>
    </div>
  );
}
