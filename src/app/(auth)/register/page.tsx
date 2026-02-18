"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }

      router.push("/login");
    } catch {
      setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#1F2126" }} className="min-h-screen flex items-center justify-center px-2">
      <div style={{ backgroundColor: "#1F2126", borderColor: "#3A3D44" }} className="w-full max-w-md border rounded-lg p-2">
        <h1 style={{ color: "#E5E7EB" }} className="text-xl font-bold text-center mb-2 leading-tight">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="space-y-1">
          <div>
            <label
              htmlFor="name"
              style={{ color: "#CBD5E1" }}
              className="block text-sm font-medium mb-1 leading-tight"
            >
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="이름을 입력하세요"
              style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
              className="w-full px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-[#64748B] leading-tight"
            />
          </div>

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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호를 입력하세요"
                style={{ backgroundColor: "#282B31", borderColor: "#3A3D44", color: "#CBD5E1" }}
                className="w-full px-2 py-1.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-[#64748B] leading-tight"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: "#94A3B8" }}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-300 transition"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.05 6.05m3.828 3.828l4.242 4.242M15.12 15.12l2.83 2.83M6.05 6.05L3 3m3.05 3.05l2.828 2.828" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <p style={{ color: "#94A3B8" }} className="mt-1 text-center text-sm leading-tight">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            style={{ color: "#60A5FA" }}
            className="font-medium hover:text-blue-300 hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
