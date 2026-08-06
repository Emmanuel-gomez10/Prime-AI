import React, { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const SettingsView: React.FC = () => {
  const [siteName, setSiteName] = useState("Prime");
  const [enableSignup, setEnableSignup] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  const handleSave = () => {
    toast.success("Admin system settings updated!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin System Settings</h1>
        <p className="text-gray-400 text-xs mt-1">Configure global application branding, security rules, registration toggles, and API keys.</p>
      </div>

      <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-6 max-w-2xl">
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Application Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <span className="font-semibold text-white block">Allow Public Student Registration</span>
              <span className="text-gray-400 text-[11px]">When disabled, new signups will be blocked.</span>
            </div>
            <input
              type="checkbox"
              checked={enableSignup}
              onChange={(e) => setEnableSignup(e.target.checked)}
              className="w-4 h-4 accent-[#7C3AED]"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <span className="font-semibold text-white block">Require Email Verification</span>
              <span className="text-gray-400 text-[11px]">Require email link confirmation before access.</span>
            </div>
            <input
              type="checkbox"
              checked={requireEmailVerification}
              onChange={(e) => setRequireEmailVerification(e.target.checked)}
              className="w-4 h-4 accent-[#7C3AED]"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

