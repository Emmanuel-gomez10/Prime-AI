import React, { useEffect, useState } from "react";
import { Save, AlertTriangle, Megaphone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/admin/adminService";
import type { AuditLogRecord } from "../../services/admin/adminService";

export const SettingsView: React.FC = () => {
  const [siteName, setSiteName] = useState("Prime AI");
  const [enableSignup, setEnableSignup] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalAnnouncement, setGlobalAnnouncement] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const settings = await adminService.getSystemSettings();
      if (settings.site_name) setSiteName(settings.site_name);
      if (settings.enable_signup !== undefined) setEnableSignup(settings.enable_signup);
      if (settings.require_email_verification !== undefined) setRequireEmailVerification(settings.require_email_verification);
      if (settings.maintenance_mode !== undefined) setMaintenanceMode(settings.maintenance_mode);
      if (settings.global_announcement) setGlobalAnnouncement(settings.global_announcement);

      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await adminService.saveSystemSetting("site_name", siteName);
    await adminService.saveSystemSetting("enable_signup", enableSignup);
    await adminService.saveSystemSetting("require_email_verification", requireEmailVerification);
    await adminService.saveSystemSetting("maintenance_mode", maintenanceMode);
    await adminService.saveSystemSetting("global_announcement", globalAnnouncement);
    setSaving(false);

    toast.success("System settings and maintenance configuration saved!");
    const updatedLogs = await adminService.getAuditLogs();
    setAuditLogs(updatedLogs);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin System Settings & Audit Control</h1>
          <p className="text-gray-400 text-xs mt-1">Configure global application maintenance mode, registration policies, and view administrative audit trails.</p>
        </div>

        {saving && <span className="text-xs text-[#41E5FF] animate-pulse">Persisting changes to Supabase...</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Settings Card */}
        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-6 shadow-2xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#41E5FF]" /> Global Platform Settings
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Application Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <span className="font-semibold text-white block">Maintenance Mode</span>
                <span className="text-gray-400 text-[11px]">Restricts student dashboard access with a maintenance banner. /admin remains accessible.</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-rose-500 cursor-pointer"
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

            <div>
              <label className="text-gray-300 font-semibold block mb-1 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-[#41E5FF]" /> Global System Announcement Banner
              </label>
              <textarea
                rows={2}
                value={globalAnnouncement}
                onChange={(e) => setGlobalAnnouncement(e.target.value)}
                placeholder="Optional banner message displayed at the top of student dashboards..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>

        {/* Audit Log Card */}
        <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 space-y-4 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Admin Audit Logs
            </h2>
            <p className="text-xs text-gray-400 mt-1">Immutable audit records of admin actions, role changes, and system settings updates.</p>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-xl p-3 font-mono text-xs text-gray-300 space-y-2 max-h-80 overflow-y-auto flex-1 my-2">
            {loading ? (
              <div className="text-gray-500 py-4 text-center">Loading audit log stream...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-gray-500 py-4 text-center">No administrative audit records logged yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between text-[11px] text-purple-400">
                    <span>{log.action}</span>
                    <span className="text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-white text-xs mt-0.5">{log.details}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Admin: {log.admin_email}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
