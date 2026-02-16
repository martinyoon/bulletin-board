import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/posts/[id]/like - 추천 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const likeCount = await prisma.like.count({
      where: { postId: id },
    });

    let isLiked = false;
    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId: session.user.id,
          },
        },
      });
      isLiked = !!like;
    }

    return NextResponse.json({ likeCount, isLiked });
  } catch (error) {
    console.error("추천 상태 조회 오류:", error);
    return NextResponse.json(
      { error: "추천 상태를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/like - 추천 토글 (인증 필요)
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

    // 게시글 존재 여부 확인
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

    // 기존 추천 확인
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // 추천 취소
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    } else {
      // 추천 + 비추천 자동 해제
      await prisma.dislike.deleteMany({
        where: { postId: id, userId: session.user.id },
      });
      await prisma.like.create({
        data: {
          postId: id,
          userId: session.user.id,
        },
      });
    }

    const likeCount = await prisma.like.count({
      where: { postId: id },
    });

    return NextResponse.json({
      likeCount,
      isLiked: !existingLike,
    });
  } catch (error) {
    console.error("추천 토글 오류:", error);
    return NextResponse.json(
      { error: "추천 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
