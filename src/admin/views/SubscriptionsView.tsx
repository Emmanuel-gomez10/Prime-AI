import React from "react";
import { CreditCard, Crown, DollarSign, CheckCircle2, ArrowUpRight } from "lucide-react";

export const SubscriptionsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions & Billing Management</h1>
        <p className="text-gray-400 text-xs mt-1">Manage tier limits, active student subscriptions, coupon codes, and billing history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-3">
          <span className="text-xs text-gray-400 font-semibold">Free Tier Students</span>
          <div className="text-3xl font-extrabold text-white">13,052</div>
          <p className="text-xs text-gray-400">Limit: 10 AI queries / day</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#41E5FF]/20 border border-[#7C3AED]/40 p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Premium Pro Tier</span>
            <Crown className="w-5 h-5 text-[#41E5FF]" />
          </div>
          <div className="text-3xl font-extrabold text-white">1,840</div>
          <p className="text-xs text-gray-300">$10.00 / month ($18.4k MRR)</p>
        </div>

        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-3">
          <span className="text-xs text-gray-400 font-semibold">Enterprise University Accounts</span>
          <div className="text-3xl font-extrabold text-white">5 Partners</div>
          <p className="text-xs text-emerald-400">Custom volume billing</p>
        </div>
      </div>
    </div>
  );
};

