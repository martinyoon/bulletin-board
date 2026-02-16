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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-2">
      <div className="w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2 leading-tight">
          로그인
        </h1>

        <form onSubmit={handleSubmit} className="space-y-1">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 leading-tight"
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
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 leading-tight"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 leading-tight"
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
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 leading-tight"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg p-1 border border-red-200 dark:border-red-800 leading-tight">
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

        <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400 leading-tight">
          계정이 없으신가요?{" "}
          <Link
            href="/register"
            className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
