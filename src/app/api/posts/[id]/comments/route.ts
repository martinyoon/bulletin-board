import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 재귀적으로 replies를 포함하는 include 생성 (깊이 제한 10)
function buildReplyInclude(depth: number): object {
  if (depth <= 0) {
    return {
      author: { select: { id: true, name: true, email: true } },
    };
  }
  return {
    author: { select: { id: true, name: true, email: true } },
    replies: {
      orderBy: { createdAt: "desc" as const },
      include: buildReplyInclude(depth - 1),
    },
  };
}

// GET /api/posts/[id]/comments - 댓글 목록 조회 (트리 구조)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 최상위 댓글만 조회하고, replies를 재귀적으로 포함
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: "asc" },
      include: buildReplyInclude(10),
    });

    // 전체 댓글 수
    const totalCount = await prisma.comment.count({
      where: { postId },
    });

    return NextResponse.json({ comments, totalCount });
  } catch (error) {
    console.error("댓글 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "댓글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - 댓글/대댓글 작성 (인증 필요)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id: postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "댓글 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    // parentId가 있으면 부모 댓글 존재 여부 확인
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: "부모 댓글을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    return NextResponse.json(
      { error: "댓글을 작성하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/comments?commentId=xxx - 댓글 삭제 (하위 댓글도 함께 삭제)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "삭제할 댓글 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (comment.postId !== postId) {
      return NextResponse.json(
        { error: "해당 게시글의 댓글이 아닙니다." },
        { status: 400 }
      );
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "본인이 작성한 댓글만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // onDelete: Cascade로 하위 댓글도 자동 삭제
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    return NextResponse.json(
      { error: "댓글을 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
