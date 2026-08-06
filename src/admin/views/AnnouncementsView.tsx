import React, { useState } from "react";
import { Megaphone, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  message: string;
  target: "All Students" | "Premium Only" | "Free Tier";
  status: "Active" | "Scheduled" | "Archived";
  date: string;
}

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: "anc_1", title: "🚀 New Feature: Essay Writer AI Mode", message: "Generate outline structures and improve academic grammar with our new Essay Writer tool inside your dashboard.", target: "All Students", status: "Active", date: "2026-08-05" },
    { id: "anc_2", title: "⚡ Planned Maintenance Window", message: "Supabase database optimization scheduled for Saturday at 02:00 UTC.", target: "All Students", status: "Scheduled", date: "2026-08-10" },
  ]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"All Students" | "Premium Only" | "Free Tier">("All Students");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    const newAnc: Announcement = {
      id: `anc_${Date.now()}`,
      title,
      message,
      target,
      status: "Active",
      date: new Date().toISOString().split("T")[0]
    };
    setAnnouncements([newAnc, ...announcements]);
    setTitle("");
    setMessage("");
    toast.success("Broadcast announcement created and pushed live!");
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success("Announcement deleted");
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
        {announcements.map((anc) => (
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
        ))}
      </div>
    </div>
  );
};

