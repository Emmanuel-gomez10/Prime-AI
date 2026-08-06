import React, { useState } from "react";
import { Cpu, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";

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
  const [providers, setProviders] = useState<AIProvider[]>([
    { id: "openai", name: "OpenAI", defaultModel: "gpt-4o", fallbackModels: ["gpt-4o-mini", "gpt-4-turbo"], enabled: true, tokenCount: "14.2M tokens", costEstimate: "$142.50", status: "operational" },
    { id: "anthropic", name: "Anthropic Claude", defaultModel: "claude-3-5-sonnet", fallbackModels: ["claude-3-haiku"], enabled: true, tokenCount: "8.1M tokens", costEstimate: "$98.10", status: "operational" },
    { id: "gemini", name: "Google Gemini", defaultModel: "gemini-1.5-pro", fallbackModels: ["gemini-1.5-flash"], enabled: false, tokenCount: "0 tokens", costEstimate: "$0.00", status: "degraded" },
  ]);

  const [activeModel, setActiveModel] = useState("gpt-4o");

  const toggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.enabled;
        toast.info(`${p.name} provider ${nextState ? "enabled" : "disabled"}`);
        return { ...p, enabled: nextState };
      }
      return p;
    }));
  };

  const handleSetDefault = (modelName: string) => {
    setActiveModel(modelName);
    toast.success(`Primary AI model switched to ${modelName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Models & Engine Control</h1>
        <p className="text-gray-400 text-xs mt-1">Configure default models, fallback chains, token limits, and multi-provider engine orchestration.</p>
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
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("AI model cache flushed successfully")}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#41E5FF]" />
            <span>Flush Engine Cache</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((prov) => (
          <div key={prov.id} className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className={`w-5 h-5 ${prov.enabled ? "text-[#41E5FF]" : "text-gray-500"}`} />
                <h3 className="font-bold text-white text-base">{prov.name}</h3>
              </div>
              <button
                onClick={() => toggleProvider(prov.id)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  prov.enabled ? "bg-[#7C3AED]" : "bg-gray-700"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prov.enabled ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Default Model:</span>
                <span className="font-mono text-white font-semibold">{prov.defaultModel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Monthly Usage:</span>
                <span className="font-mono text-white">{prov.tokenCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Estimated Cost:</span>
                <span className="font-mono text-emerald-400 font-semibold">{prov.costEstimate}</span>
              </div>
            </div>

            <button
              onClick={() => handleSetDefault(prov.defaultModel)}
              disabled={!prov.enabled || activeModel === prov.defaultModel}
              className={`w-full py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeModel === prov.defaultModel
                  ? "bg-[#7C3AED]/20 border-[#7C3AED]/50 text-[#41E5FF]"
                  : prov.enabled
                  ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white"
                  : "bg-white/[0.02] border-white/5 text-gray-600 cursor-not-allowed"
              }`}
            >
              {activeModel === prov.defaultModel ? "Current Primary" : "Set As Primary"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

