"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        router.push("/posts");
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#1F2126" }} className="min-h-screen flex items-center justify-center px-2">
      <div style={{ backgroundColor: "#1F2126", borderColor: "#3A3D44" }} className="w-full max-w-md border rounded-lg p-2">
        <h1 style={{ color: "#E5E7EB" }} className="text-xl font-bold text-center mb-2 leading-tight">
          로그인
        </h1>

        <form onSubmit={handleSubmit} className="space-y-1">
          <div>
            <label
              htmlFor="email"
              style={{ color: "#CBD5E1" }}
              className="block text-sm font-medium mb-1 leading-tight"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
              className="w-full px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-[#64748B] leading-tight"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ color: "#CBD5E1" }}
              className="block text-sm font-medium mb-1 leading-tight"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
              style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
              className="w-full px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-[#64748B] leading-tight"
            />
          </div>

          {error && (
            <div style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "#7F1D1D", color: "#F87171" }} className="text-sm rounded-lg p-1 border leading-tight">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-1.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed leading-tight"
          >
            {loading ? "로그인 중..." : "로그인하기"}
          </button>
        </form>

        <p style={{ color: "#94A3B8" }} className="mt-1 text-center text-sm leading-tight">
          계정이 없으신가요?{" "}
          <Link
            href="/register"
            style={{ color: "#60A5FA" }}
            className="font-medium hover:text-blue-300 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
