import React, { useEffect, useState } from "react";
import { Crown, RefreshCw } from "lucide-react";
import { adminService } from "../../services/admin/adminService";

interface SubscriptionMetrics {
  freeCount: number;
  premiumCount: number;
  enterpriseCount: number;
  mrr: number;
  dailyLimit: number;
}

export const SubscriptionsView: React.FC = () => {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const loadMetrics = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminService.getSubscriptionMetrics();
      setMetrics(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions & Billing Management</h1>
          <p className="text-gray-400 text-xs mt-1">Live subscription metrics, tier distribution, and active student quotas from Supabase database.</p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#41E5FF] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-xs">Loading live subscription data from Supabase...</div>
      ) : error || !metrics ? (
        <div className="py-12 text-center text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          Failed to load live subscription data. Please check connection and try again.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-3 shadow-xl">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Free Tier Students</span>
            <div className="text-3xl font-extrabold text-white">{metrics.freeCount.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Configured Limit: <strong className="text-white">{metrics.dailyLimit}</strong> AI queries / day</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#41E5FF]/20 border border-[#7C3AED]/40 p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Premium Pro Tier</span>
              <Crown className="w-5 h-5 text-[#41E5FF]" />
            </div>
            <div className="text-3xl font-extrabold text-white">{metrics.premiumCount.toLocaleString()}</div>
            <p className="text-xs text-gray-300">
              $10.00 / month ({metrics.mrr > 0 ? `$${metrics.mrr.toLocaleString()} MRR` : "$0 MRR"})
            </p>
          </div>

          <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-3 shadow-xl">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Enterprise Accounts</span>
            <div className="text-3xl font-extrabold text-white">{metrics.enterpriseCount} Partners</div>
            <p className="text-xs text-emerald-400 font-medium">Custom volume billing</p>
          </div>
        </div>
      )}
    </div>
  );
};
