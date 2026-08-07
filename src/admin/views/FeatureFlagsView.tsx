import React, { useState } from "react";
import { Flag, Plus } from "lucide-react";
import { toast } from "sonner";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  environment: "Production" | "Staging" | "Beta";
  rolloutPercentage: number;
}

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: "ff_1",
    name: "Gemini 1.5 Pro Flashcard Extraction",
    key: "gemini_1_5_flashcards",
    description: "Uses multi-modal Gemini LLM for high-precision table extraction from PDF lectures.",
    enabled: true,
    environment: "Production",
    rolloutPercentage: 100,
  },
  {
    id: "ff_2",
    name: "DeepSeek R1 Step-by-Step Reasoning",
    key: "deepseek_r1_math_solver",
    description: "Routes math and physics problems through DeepSeek-R1 chain-of-thought engine.",
    enabled: true,
    environment: "Beta",
    rolloutPercentage: 50,
  },
  {
    id: "ff_3",
    name: "Real-time AI Voice Study Tutor",
    key: "voice_tutor_webrtc",
    description: "Enables bi-directional low-latency voice conversations with Prime AI tutor.",
    enabled: false,
    environment: "Staging",
    rolloutPercentage: 10,
  },
  {
    id: "ff_4",
    name: "Collaborative Study Group Threads",
    key: "collab_group_threads",
    description: "Allows multiple students in the same course to share flashcard sets real-time.",
    enabled: true,
    environment: "Production",
    rolloutPercentage: 75,
  },
];

export const FeatureFlagsView: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagKey, setNewFlagKey] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");

  const toggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => {
      if (f.id === id) {
        const updated = !f.enabled;
        toast.success(`Feature flag "${f.name}" is now ${updated ? "ENABLED" : "DISABLED"}`);
        return { ...f, enabled: updated };
      }
      return f;
    }));
  };

  const handleRolloutChange = (id: string, percentage: number) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, rolloutPercentage: percentage } : f));
  };

  const handleCreateFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagName || !newFlagKey) return;
    const newFlag: FeatureFlag = {
      id: `ff_${Date.now()}`,
      name: newFlagName,
      key: newFlagKey.toLowerCase().replace(/\s+/g, "_"),
      description: newFlagDesc || "Custom feature flag",
      enabled: false,
      environment: "Beta",
      rolloutPercentage: 25,
    };
    setFlags(prev => [newFlag, ...prev]);
    toast.success(`Feature flag "${newFlagName}" created!`);
    setShowCreateModal(false);
    setNewFlagName("");
    setNewFlagKey("");
    setNewFlagDesc("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flag className="w-6 h-6 text-[#41E5FF]" /> Feature Flags & Experiments
          </h1>
          <p className="text-gray-400 text-xs mt-1">Safely roll out new AI models, beta tools, and UI features to target student cohorts.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Feature Flag</span>
        </button>
      </div>

      {/* Feature Flags Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className={`p-6 rounded-2xl bg-[#121428]/80 backdrop-blur-xl border transition-all duration-300 space-y-4 ${
              flag.enabled
                ? "border-[#7C3AED]/50 shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                : "border-white/10 opacity-80"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{flag.name}</h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    flag.environment === "Production" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                    flag.environment === "Beta" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                    "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {flag.environment}
                  </span>
                </div>
                <code className="text-[11px] font-mono text-purple-400 mt-1 block">{flag.key}</code>
              </div>

              <button
                onClick={() => toggleFlag(flag.id)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                  flag.enabled ? "bg-gradient-to-r from-[#7C3AED] to-[#41E5FF]" : "bg-white/10"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  flag.enabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">{flag.description}</p>

            <div className="pt-3 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Rollout Allocation:</span>
                <span className="text-[#41E5FF] font-bold font-mono">{flag.rolloutPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={flag.rolloutPercentage}
                onChange={(e) => handleRolloutChange(flag.id, Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#41E5FF]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating New Feature Flag */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#121428] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Create New Feature Flag</h3>
            
            <form onSubmit={handleCreateFlag} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Feature Name</label>
                <input
                  type="text"
                  required
                  value={newFlagName}
                  onChange={(e) => setNewFlagName(e.target.value)}
                  placeholder="e.g. Gemini 2.0 Flash Integration"
                  className="w-full bg-[#070816] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Flag Key (SDK identifier)</label>
                <input
                  type="text"
                  required
                  value={newFlagKey}
                  onChange={(e) => setNewFlagKey(e.target.value)}
                  placeholder="e.g. gemini_2_flash_v1"
                  className="w-full bg-[#070816] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newFlagDesc}
                  onChange={(e) => setNewFlagDesc(e.target.value)}
                  placeholder="Briefly describe what this feature flag controls..."
                  className="w-full bg-[#070816] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] text-gray-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold shadow-lg"
                >
                  Create Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
