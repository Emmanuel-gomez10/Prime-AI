import React, { useEffect, useState } from "react";
import { adminService } from "../../services/admin/adminService";
import type { AnalyticsData } from "../../services/admin/adminService";
import { Filter, Activity } from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const res = await adminService.getAnalyticsData(days);
      setData(res);
      setLoading(false);
    };
    fetchAnalytics();
  }, [days]);

  const maxDau = data ? Math.max(...data.dauGrowth.map(d => d.value), 1) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Analytics & Intelligence</h1>
          <p className="text-gray-400 text-xs mt-1">Deep analytics on daily active users, feature usage, and request success rates.</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Time Period:</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-[#121428] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Daily AI Usage Activity</span>
            <span className="text-emerald-400 font-mono text-xs">{data ? `${data.successRate}% Success` : "..."}</span>
          </h3>
          <div className="h-48 flex items-end justify-between gap-2 pt-8 px-2 border-b border-white/10">
            {data && data.dauGrowth.length > 0 ? (
              data.dauGrowth.map((item, i) => {
                const heightPct = Math.max(Math.round((item.value / maxDau) * 100), 8);
                return (
                  <div key={i} className="w-full flex flex-col items-center gap-2">
                    <div 
                      style={{ height: `${heightPct}%` }} 
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#7C3AED] to-[#41E5FF] shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-all"
                      title={`${item.day}: ${item.value} requests`}
                    />
                    <span className="text-[10px] text-gray-400">{item.day}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-xs text-gray-400 py-12">No usage data recorded yet</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Most-Used AI Features</span>
            <span className="text-[#41E5FF] font-mono text-xs">{data ? `${data.totalRequests} Total Requests` : "..."}</span>
          </h3>
          <div className="space-y-4 text-xs">
            {data && data.featureBreakdown.length > 0 ? (
              data.featureBreakdown.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>{item.name}</span>
                    <span className="font-semibold text-white">{item.percentage}% ({item.count})</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-gray-400 py-12">No AI feature usage recorded yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

