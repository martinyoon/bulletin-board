import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const session = await auth();

    const dislikeCount = await prisma.commentDislike.count({
      where: { commentId },
    });

    let isDisliked = false;
    if (session?.user?.id) {
      const dislike = await prisma.commentDislike.findUnique({
        where: {
          commentId_userId: { commentId, userId: session.user.id },
        },
      });
      isDisliked = !!dislike;
    }

    return NextResponse.json({ dislikeCount, isDisliked });
  } catch (error) {
    console.error("댓글 비추천 조회 오류:", error);
    return NextResponse.json({ error: "오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });
    if (!comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    const existing = await prisma.commentDislike.findUnique({
      where: {
        commentId_userId: { commentId, userId: session.user.id },
      },
    });

    if (existing) {
      await prisma.commentDislike.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentLike.deleteMany({
        where: { commentId, userId: session.user.id },
      });
      await prisma.commentDislike.create({
        data: { commentId, userId: session.user.id },
      });
    }

    const dislikeCount = await prisma.commentDislike.count({ where: { commentId } });

    return NextResponse.json({ dislikeCount, isDisliked: !existing });
  } catch (error) {
    console.error("댓글 비추천 토글 오류:", error);
    return NextResponse.json({ error: "오류가 발생했습니다." }, { status: 500 });
  }
}
