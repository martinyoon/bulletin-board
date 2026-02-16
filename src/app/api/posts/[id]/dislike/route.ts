import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/posts/[id]/dislike - 비추천 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const dislikeCount = await prisma.dislike.count({
      where: { postId: id },
    });

    let isDisliked = false;
    if (session?.user?.id) {
      const dislike = await prisma.dislike.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId: session.user.id,
          },
        },
      });
      isDisliked = !!dislike;
    }

    return NextResponse.json({ dislikeCount, isDisliked });
  } catch (error) {
    console.error("비추천 상태 조회 오류:", error);
    return NextResponse.json(
      { error: "비추천 상태를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/dislike - 비추천 토글 (인증 필요)
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

    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const existingDislike = await prisma.dislike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingDislike) {
      await prisma.dislike.delete({
        where: { id: existingDislike.id },
      });
    } else {
      // 비추천 + 추천 자동 해제
      await prisma.like.deleteMany({
        where: { postId: id, userId: session.user.id },
      });
      await prisma.dislike.create({
        data: {
          postId: id,
          userId: session.user.id,
        },
      });
    }

    const dislikeCount = await prisma.dislike.count({
      where: { postId: id },
    });

    return NextResponse.json({
      dislikeCount,
      isDisliked: !existingDislike,
    });
  } catch (error) {
    console.error("비추천 토글 오류:", error);
    return NextResponse.json(
      { error: "비추천 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
