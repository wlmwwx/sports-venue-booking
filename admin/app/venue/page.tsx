"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyVenues, Venue } from "@/lib/venue-api";

const STATUS_LABELS: Record<string, string> = {
  pending: "待审核", approved: "已上架", rejected: "已驳回", suspended: "已下架",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50", approved: "text-green-600 bg-green-50",
  rejected: "text-red-600 bg-red-50", suspended: "text-gray-600 bg-gray-100",
};

export default function VenueListPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyVenues().then(setVenues).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">我的场馆</h1>
          <Link href="/venue/create"
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            入驻新场馆
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-500 text-center py-12">加载中...</p>
        ) : venues.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">还没有场馆</p>
            <Link href="/venue/create" className="text-green-600 hover:underline">立即入驻</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {venues.map((v) => (
              <div key={v._id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{v.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{v.address}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v.status]}`}>
                    {STATUS_LABELS[v.status]}
                  </span>
                  {v.rejectReason && <p className="text-xs text-red-500 mt-1">驳回原因：{v.rejectReason}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
