import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json();

  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "모든 필드를 입력해주세요." },
      { status: 400 }
    );
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { error: "이미 사용 중인 이메일입니다." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, password: hashed },
  });

  return NextResponse.json({ message: "회원가입 성공" }, { status: 201 });
}
