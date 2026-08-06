import React from "react";
import { Activity, Database, Server, Cpu, HardDrive, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const SystemHealthView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Health & Infrastructure</h1>
          <p className="text-gray-400 text-xs mt-1">Real-time status monitor for Supabase DB connections, AI API gateways, background workers, and storage.</p>
        </div>

        <button
          onClick={() => toast.success("Refreshed infrastructure health status")}
          className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#41E5FF]" />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">Supabase Database</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">Operational</div>
          <p className="text-[11px] text-gray-400">Response time: <strong className="text-emerald-400">18 ms</strong></p>
        </div>

        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">OpenAI API Gateway</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">Operational</div>
          <p className="text-[11px] text-gray-400">Average Latency: <strong className="text-purple-400">420 ms</strong></p>
        </div>

        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">Background Storage (GCS)</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">Operational</div>
          <p className="text-[11px] text-gray-400">Capacity: <strong className="text-cyan-400">482 GB / 1 TB</strong></p>
        </div>

        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">Edge CDN (Vercel)</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">100% Uptime</div>
          <p className="text-[11px] text-gray-400">SSL Certificate: <strong className="text-emerald-400">Valid (TLS 1.3)</strong></p>
        </div>
      </div>

      {/* Logs section */}
      <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live System Logs</h3>
        <div className="bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-xs text-gray-300 space-y-2 max-h-60 overflow-y-auto">
          <div className="text-emerald-400">[2026-08-06 06:48:12] [INFO] Supabase connection pool healthy. Active connections: 42.</div>
          <div className="text-purple-400">[2026-08-06 06:49:05] [API] POST /v1/chat/completions 200 OK (384ms) - User: usr_101</div>
          <div className="text-[#41E5FF]">[2026-08-06 06:50:00] [CRON] Automated backup worker executed successfully. Snapshot saved.</div>
        </div>
      </div>
    </div>
  );
};

