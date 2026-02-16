import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/posts/[id] - 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("게시글 조회 오류:", error);
    return NextResponse.json(
      { error: "게시글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - 게시글 수정 (인증 필요, 작성자만 가능)
export async function PUT(
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

    const { id } = await params;

    // 게시글 존재 여부 및 작성자 확인
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "본인이 작성한 게시글만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    // 유효성 검사
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "제목을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("게시글 수정 오류:", error);
    return NextResponse.json(
      { error: "게시글을 수정하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 게시글 삭제 (인증 필요, 작성자만 가능)
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

    const { id } = await params;

    // 게시글 존재 여부 및 작성자 확인
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "본인이 작성한 게시글만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 게시글 삭제 (댓글은 onDelete: Cascade로 자동 삭제)
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    return NextResponse.json(
      { error: "게시글을 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
