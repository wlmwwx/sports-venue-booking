"use client";

import { useState } from "react";
import { register } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(phone, password, username);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">场馆入驻注册</h1>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名（选填）</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入姓名" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位密码" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required minLength={6} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          已有账号？<Link href="/login" className="text-green-600 hover:underline">去登录</Link>
        </div>
      </div>
    </main>
  );
}
