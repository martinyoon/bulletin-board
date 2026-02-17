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

    const likeCount = await prisma.commentLike.count({
      where: { commentId },
    });

    let isLiked = false;
    if (session?.user?.id) {
      const like = await prisma.commentLike.findUnique({
        where: {
          commentId_userId: { commentId, userId: session.user.id },
        },
      });
      isLiked = !!like;
    }

    return NextResponse.json({ likeCount, isLiked });
  } catch (error) {
    console.error("댓글 추천 조회 오류:", error);
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

    const existing = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: { commentId, userId: session.user.id },
      },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentDislike.deleteMany({
        where: { commentId, userId: session.user.id },
      });
      await prisma.commentLike.create({
        data: { commentId, userId: session.user.id },
      });
    }

    const likeCount = await prisma.commentLike.count({ where: { commentId } });

    return NextResponse.json({ likeCount, isLiked: !existing });
  } catch (error) {
    console.error("댓글 추천 토글 오류:", error);
    return NextResponse.json({ error: "오류가 발생했습니다." }, { status: 500 });
  }
}
