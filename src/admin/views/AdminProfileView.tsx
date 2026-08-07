import React, { useState } from "react";
import { User, Shield, Key, RefreshCw, Laptop } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export const AdminProfileView: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("pk_live_prime_admin_984a8c71b209e4f");

  const handleRegenerateKey = () => {
    const newKey = `pk_live_prime_admin_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 6)}`;
    setApiKey(newKey);
    toast.success("New Administrative Master API Key generated!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-[#41E5FF]" /> Superuser Admin Profile
        </h1>
        <p className="text-gray-400 text-xs mt-1">Manage system administrator credentials, security keys, and access logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="md:col-span-1 rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#41E5FF] p-1 mx-auto shadow-2xl">
            <div className="w-full h-full bg-[#070816] rounded-full flex items-center justify-center text-white text-3xl font-extrabold">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{user?.user_metadata?.full_name || "Emmanuel Gomez"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email || "eorji362@gmail.com"}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#41E5FF] text-xs font-bold mt-3">
              <Shield className="w-3.5 h-3.5" /> Superuser Administrator
            </span>
          </div>

          <div className="pt-4 border-t border-white/10 text-left space-y-2 text-xs text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Role level:</span>
              <span className="font-semibold text-white">Full Access (Root)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">2FA Security:</span>
              <span className="font-semibold text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Login:</span>
              <span className="font-semibold text-gray-300">Today, 11:12 AM</span>
            </div>
          </div>
        </div>

        {/* Security & API Keys */}
        <div className="md:col-span-2 rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-6">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
            <Key className="w-5 h-5 text-purple-400" /> Administrative Security & API Keys
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-300">Master Administrative Secret Key</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full bg-[#070816] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 font-mono"
              />
              <button
                onClick={handleRegenerateKey}
                className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center gap-2 shrink-0 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400">This key grants bypass permissions for administrative API endpoints.</p>
          </div>

          {/* Active Admin Sessions */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Active Admin Sessions</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[#070816]/60 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Laptop className="w-4 h-4 text-[#41E5FF]" />
                  <div>
                    <span className="font-semibold text-white">Windows Desktop (Current Device)</span>
                    <span className="text-[10px] text-gray-400 block">IP: 102.89.23.11 • Chrome 127</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Active Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
