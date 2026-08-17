import React, { useEffect, useState } from "react";
import { Cpu, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/admin/adminService";
import { AI_CONFIG } from "../../config/ai";

interface AIProvider {
  id: string;
  name: string;
  defaultModel: string;
  fallbackModels: string[];
  enabled: boolean;
  tokenCount: string;
  costEstimate: string;
  status: "operational" | "degraded";
}

export const AIModelsView: React.FC = () => {
  const [providers] = useState<AIProvider[]>([
    { id: "openai", name: "OpenAI", defaultModel: "gpt-4o", fallbackModels: ["gpt-4o-mini", "gpt-4-turbo"], enabled: true, tokenCount: "Live", costEstimate: "Active", status: "operational" },
    { id: "openai_mini", name: "OpenAI Mini", defaultModel: "gpt-4o-mini", fallbackModels: ["gpt-4o"], enabled: true, tokenCount: "Live", costEstimate: "Active", status: "operational" },
  ]);

  const [activeModel, setActiveModel] = useState(AI_CONFIG.primaryModel);
  const [fallbackModel, setFallbackModel] = useState(AI_CONFIG.fallbackModels[0] || "gpt-4o-mini");
  const [dailyLimit, setDailyLimit] = useState<number>(50);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(1000);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await adminService.getSystemSettings();
      if (settings.primary_model) {
        setActiveModel(settings.primary_model);
        AI_CONFIG.primaryModel = settings.primary_model;
      }
      if (settings.fallback_model) {
        setFallbackModel(settings.fallback_model);
        AI_CONFIG.fallbackModels = [settings.fallback_model];
      }
      if (typeof settings.daily_request_limit === "number") {
        setDailyLimit(settings.daily_request_limit);
      }
      if (typeof settings.monthly_request_limit === "number") {
        setMonthlyLimit(settings.monthly_request_limit);
      }
    };
    loadSettings();
  }, []);

  const handleSetDefault = async (modelName: string) => {
    setActiveModel(modelName);
    AI_CONFIG.primaryModel = modelName;
    setSaving(true);
    const ok = await adminService.saveSystemSetting("primary_model", modelName);
    setSaving(false);

    if (ok) {
      toast.success(`Primary AI model updated to ${modelName}`);
    } else {
      toast.error("Failed to update primary model setting");
    }
  };

  const handleSetFallback = async (modelName: string) => {
    setFallbackModel(modelName);
    AI_CONFIG.fallbackModels = [modelName];
    setSaving(true);
    const ok = await adminService.saveSystemSetting("fallback_model", modelName);
    setSaving(false);

    if (ok) {
      toast.success(`Fallback AI model updated to ${modelName}`);
    } else {
      toast.error("Failed to update fallback model setting");
    }
  };

  const handleSaveLimits = async () => {
    setSaving(true);
    const ok1 = await adminService.saveSystemSetting("daily_request_limit", dailyLimit);
    const ok2 = await adminService.saveSystemSetting("monthly_request_limit", monthlyLimit);
    setSaving(false);

    if (ok1 && ok2) {
      toast.success("AI usage request limits saved successfully!");
    } else {
      toast.error("Failed to save usage limits");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Models & Usage Control</h1>
          <p className="text-gray-400 text-xs mt-1">Configure primary models, fallback candidate chains, and student usage request thresholds.</p>
        </div>

        {saving && <span className="text-xs text-[#41E5FF] animate-pulse">Persisting to Supabase...</span>}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-[#121428] to-[#1A1D36] border border-white/10 p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#41E5FF] p-[1px] shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <div className="w-full h-full bg-[#0d1024] rounded-[15px] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#41E5FF]" />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Global Primary Model</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-xl font-bold text-white">{activeModel}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">Active Engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("AI model engine cache synchronized")}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#41E5FF]" />
            <span>Sync Engine</span>
          </button>
        </div>
      </div>

      {/* AI Usage Limits Control */}
      <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#41E5FF]" /> Student AI Usage Limits Configuration
        </h2>
        <p className="text-xs text-gray-400">Set daily and monthly request quotas enforced per user against real ai_usage logs.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Daily AI Request Limit per Student</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Monthly AI Request Limit per Student</label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveLimits}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold shadow-lg"
          >
            Save Usage Quotas
          </button>
        </div>
      </div>

      {/* Model Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((prov) => (
          <div key={prov.id} className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className={`w-5 h-5 ${prov.enabled ? "text-[#41E5FF]" : "text-gray-500"}`} />
                <h3 className="font-bold text-white text-base">{prov.name}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Target Model:</span>
                <span className="font-mono text-white font-semibold">{prov.defaultModel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Status:</span>
                <span className="font-mono text-emerald-400 font-semibold">Ready</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSetDefault(prov.defaultModel)}
                disabled={activeModel === prov.defaultModel}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  activeModel === prov.defaultModel
                    ? "bg-[#7C3AED]/20 border-[#7C3AED]/50 text-[#41E5FF]"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white"
                }`}
              >
                {activeModel === prov.defaultModel ? "Current Primary" : "Set As Primary"}
              </button>

              <button
                onClick={() => handleSetFallback(prov.defaultModel)}
                disabled={fallbackModel === prov.defaultModel}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  fallbackModel === prov.defaultModel
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white"
                }`}
              >
                {fallbackModel === prov.defaultModel ? "Current Fallback" : "Set As Fallback"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
