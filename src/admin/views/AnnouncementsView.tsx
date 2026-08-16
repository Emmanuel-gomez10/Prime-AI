import React, { useEffect, useState } from "react";
import { Megaphone, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/admin/adminService";
import type { AnnouncementRecord } from "../../services/admin/adminService";

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"All Students" | "Premium Only" | "Free Tier">("All Students");
  const [loading, setLoading] = useState(true);

  const loadAnnouncements = async () => {
    setLoading(true);
    const data = await adminService.getAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const ok = await adminService.createAnnouncement(title, message, target);
    if (ok) {
      toast.success("Broadcast announcement created and saved to database!");
      setTitle("");
      setMessage("");
      loadAnnouncements();
    } else {
      toast.error("Failed to post announcement");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await adminService.deleteAnnouncement(id);
    if (ok) {
      toast.success("Announcement removed");
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } else {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Announcements & Broadcast System</h1>
        <p className="text-gray-400 text-xs mt-1">Broadcast system banners, feature updates, and exam reminders directly into student dashboards.</p>
      </div>

      <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-6 shadow-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#41E5FF]" /> Create New Broadcast Announcement
        </h2>

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-gray-400 block mb-1 font-semibold">Announcement Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 📢 Past Questions Update for 2026 First Semester"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Target Audience</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white"
              >
                <option value="All Students" className="bg-[#121428]">All Students</option>
                <option value="Premium Only" className="bg-[#121428]">Premium Only</option>
                <option value="Free Tier" className="bg-[#121428]">Free Tier</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1 font-semibold">Message Content</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement details here..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
            >
              <Bell className="w-4 h-4" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active & Scheduled Broadcasts</h3>
        {loading ? (
          <div className="py-8 text-center text-gray-400">Loading broadcasts...</div>
        ) : announcements.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No active announcements.</div>
        ) : (
          announcements.map((anc) => (
            <div key={anc.id} className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{anc.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#41E5FF]/20 text-[#41E5FF] text-[10px] font-semibold border border-[#41E5FF]/30">
                    {anc.target}
                  </span>
                </div>
                <p className="text-gray-300 text-xs">{anc.message}</p>
                <span className="text-[10px] text-gray-500 block">Published: {anc.date}</span>
              </div>

              <button
                onClick={() => handleDelete(anc.id)}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 self-start sm:self-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
