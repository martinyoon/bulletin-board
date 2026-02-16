import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/posts - 게시글 목록 조회 (페이지네이션 + 검색)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * pageSize;

    // 검색 조건 구성
    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
          ],
        }
      : {};

    // 전체 게시글 수와 게시글 목록을 병렬로 조회
    const [totalCount, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
              dislikes: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      posts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "게시글 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/posts - 게시글 작성 (인증 필요)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
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

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: session.user.id,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("게시글 작성 오류:", error);
    return NextResponse.json(
      { error: "게시글을 작성하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
