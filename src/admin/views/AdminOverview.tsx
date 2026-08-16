import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  Cpu, 
  FileText, 
  BookMarked, 
  FileQuestion, 
  HardDrive, 
  Crown, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Activity, 
  Megaphone,
  Loader2
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { adminService } from "../../services/admin/adminService";
import type { AdminOverviewMetrics } from "../../services/admin/adminService";

export const AdminOverview: React.FC = () => {
  const { setActiveView } = useAdmin();
  const [metrics, setMetrics] = useState<AdminOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      const data = await adminService.getOverviewMetrics();
      setMetrics(data);
      setLoading(false);
    };
    fetchMetrics();
  }, []);

  const kpiCards = [
    { title: "Total Users", value: metrics ? metrics.totalUsers.toLocaleString() : "...", change: "Real-time", isPositive: true, icon: Users, color: "from-[#7C3AED] to-[#9333EA]" },
    { title: "Active Users Today", value: metrics ? metrics.activeUsersToday.toLocaleString() : "...", change: "Live", isPositive: true, icon: UserCheck, color: "from-blue-600 to-cyan-500" },
    { title: "AI Requests Today", value: metrics ? metrics.aiRequestsToday.toLocaleString() : "...", change: "Live", isPositive: true, icon: Cpu, color: "from-purple-600 to-pink-500" },
    { title: "Uploaded PDFs", value: metrics ? metrics.totalPdfs.toLocaleString() : "...", change: "Live", isPositive: true, icon: FileText, color: "from-emerald-600 to-teal-500" },
    { title: "Generated Flashcards", value: metrics ? metrics.totalFlashcards.toLocaleString() : "...", change: "Live", isPositive: true, icon: BookMarked, color: "from-amber-500 to-orange-500" },
    { title: "Generated Quizzes", value: metrics ? metrics.totalQuizzes.toLocaleString() : "...", change: "Live", isPositive: true, icon: FileQuestion, color: "from-indigo-600 to-blue-500" },
    { title: "Total AI Usage Logs", value: metrics ? metrics.totalUsage.toLocaleString() : "...", change: "Recorded", isPositive: true, icon: HardDrive, color: "from-slate-600 to-slate-800" },
    { title: "Premium Subscribers", value: metrics ? metrics.premiumSubscribers.toLocaleString() : "...", change: "Active", isPositive: true, icon: Crown, color: "from-amber-400 to-yellow-600" },
    { title: "Est. Monthly Revenue", value: metrics ? `$${metrics.monthlyRevenue.toLocaleString()}` : "...", change: "Live", isPositive: true, icon: DollarSign, color: "from-emerald-500 to-green-600" },
  ];

  const recentActivities = [
    { type: "user", title: "New Registration", detail: "David Okon registered (University of Lagos)", time: "2 mins ago" },
    { type: "ai", title: "High Token Request", detail: "Generated 50 flashcards for Bio 301", time: "5 mins ago" },
    { type: "upload", title: "PDF Material Uploaded", detail: "Organic_Chemistry_Summary.pdf (14.2 MB)", time: "12 mins ago" },
    { type: "sub", title: "Upgrade to Premium", detail: "Sarah Jenkins purchased Annual Plan", time: "25 mins ago" },
    { type: "system", title: "Database Backup Completed", detail: "Automated snapshot backup #8492", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121428] via-[#1A1D36] to-[#0D0F20] border border-white/10 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-12 w-64 h-64 bg-[#41E5FF]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#41E5FF] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Prime Admin Intelligence
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Control & Operations Panel
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Monitor active student sessions, system performance metrics, AI engine throughput, and subscriber activity in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView("announcements")}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg"
            >
              <Megaphone className="w-4 h-4 text-[#41E5FF]" />
              <span>New Announcement</span>
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:opacity-95 transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Full Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#41E5FF]" /> Overview Metrics
          </h2>
          <span className="text-xs text-gray-400">Live stats updated 30s ago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-5 shadow-xl hover:border-[#7C3AED]/50 hover:bg-[#161933] transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-400">{card.title}</span>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">{card.value}</h3>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} p-[1px] shadow-lg shrink-0`}>
                    <div className="w-full h-full bg-[#0d1024] rounded-[11px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1 font-semibold ${
                    card.isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {card.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {card.change}
                  </span>
                  <span className="text-gray-500">vs last month</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Section: Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions Panel */}
          <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#41E5FF]" /> Administrative Quick Actions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveView("announcements")}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-all group flex flex-col justify-between h-28"
              >
                <Megaphone className="w-5 h-5 text-[#41E5FF] group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-white block">Broadcast Message</span>
                  <span className="text-[11px] text-gray-400">Push to all students</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView("past-questions")}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-all group flex flex-col justify-between h-28"
              >
                <Plus className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-white block">Add Past Questions</span>
                  <span className="text-[11px] text-gray-400">Upload exam papers</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView("ai-models")}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-all group flex flex-col justify-between h-28"
              >
                <Sliders className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-white block">Manage AI Models</span>
                  <span className="text-[11px] text-gray-400">Switch active engine</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView("analytics")}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-all group flex flex-col justify-between h-28"
              >
                <Activity className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-white block">View Reports</span>
                  <span className="text-[11px] text-gray-400">Export PDF logs</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView("users")}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-all group flex flex-col justify-between h-28"
              >
                <UserX className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-white block">Suspend User</span>
                  <span className="text-[11px] text-gray-400">Revoke student access</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView("support")}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-all group flex flex-col justify-between h-28"
              >
                <Send className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-white block">Support Tickets</span>
                  <span className="text-[11px] text-gray-400">Reply to student requests</span>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">Recent Platform Activity</h3>
              <button 
                onClick={() => setActiveView("analytics")}
                className="text-xs text-[#41E5FF] hover:underline font-medium"
              >
                View Full Audit Log
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#41E5FF] shadow-[0_0_8px_#41E5FF]" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{act.title}</h4>
                      <p className="text-[11px] text-gray-400">{act.detail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Realtime Engine Health Status */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
              <span>System Health</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                Operational
              </span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Supabase DB Connection</span>
                  <span className="text-emerald-400 font-medium">18 ms</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[95%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>OpenAI API Rate Limit</span>
                  <span className="text-purple-400 font-medium">32% consumed</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[32%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Storage Utilization</span>
                  <span className="text-cyan-400 font-medium">482 / 1000 GB</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[48%]" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView("system-health")}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white transition-colors"
            >
              Open Health Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

