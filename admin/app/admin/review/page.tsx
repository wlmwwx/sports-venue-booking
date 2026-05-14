"use client";

import { useEffect, useState } from "react";
import { listPending, approveVenue, rejectVenue, Venue } from "@/lib/venue-api";

export default function ReviewPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetchList = () => {
    setLoading(true);
    listPending().then(setVenues).finally(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, []);

  const handleApprove = async (id: string) => {
    await approveVenue(id);
    fetchList();
  };

  const handleReject = async (id: string) => {
    if (!reason) return;
    await rejectVenue(id, reason);
    setRejectingId(null);
    setReason("");
    fetchList();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">场馆审核</h1>
        {loading ? <p className="text-gray-500 text-center py-12">加载中...</p>
        : venues.length === 0 ? <p className="text-gray-500 text-center py-12">暂无待审核场馆</p>
        : <div className="space-y-3">
          {venues.map((v) => (
            <div key={v._id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{v.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{v.address}</p>
                  <div className="flex gap-1 mt-2">
                    {v.sportTypes?.map((t) => <span key={t} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{t}</span>)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(v._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">通过</button>
                  <button onClick={() => setRejectingId(v._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">驳回</button>
                </div>
              </div>
              {rejectingId === v._id && (
                <div className="mt-3 pt-3 border-t">
                  <input value={reason} onChange={(e) => setReason(e.target.value)}
                    placeholder="请输入驳回原因" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleReject(v._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm">确认驳回</button>
                    <button onClick={() => setRejectingId(null)}
                      className="px-3 py-1 bg-gray-200 rounded text-sm">取消</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>}
      </div>
    </main>
  );
}
