"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVenue } from "@/lib/venue-api";

const SPORT_TYPES = ["羽毛球", "篮球", "网球", "游泳", "足球", "乒乓球", "健身", "其他"];

export default function CreateVenuePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", address: "", latitude: 0, longitude: 0,
    businessHours: "", phone: "", description: "",
    sportTypes: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSport = (type: string) => {
    setForm((f) => ({
      ...f,
      sportTypes: f.sportTypes.includes(type)
        ? f.sportTypes.filter((t) => t !== type)
        : [...f.sportTypes, type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createVenue(form);
      router.push("/venue");
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6">入驻场馆</h1>
        {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">场馆名称 *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={30} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">运动类型 *</label>
            <div className="flex flex-wrap gap-2">
              {SPORT_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => toggleSport(type)}
                  className={`px-3 py-1 rounded-full text-sm border ${form.sportTypes.includes(type) ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300"}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">详细地址 *</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">营业时间</label>
              <input type="text" value={form.businessHours} onChange={(e) => setForm({ ...form, businessHours: e.target.value })}
                placeholder="08:00-22:00" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系电话 *</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">场馆简介</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={200} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? "提交中..." : "提交审核"}
          </button>
        </form>
      </div>
    </main>
  );
}
