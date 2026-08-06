import React, { useState } from "react";
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  Plus, 
  ShieldCheck, 
  Sparkles,
  Command,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const AdminTopBar: React.FC = () => {
  const { isSidebarCollapsed, searchQuery, setSearchQuery, setIsMobileOpen, setActiveView } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <header className={`h-18 border-b border-white/[0.08] bg-[#0A0C14]/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8 transition-all duration-300 ${
      isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
    }`}>
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, models, resources, logs..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-12 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-gray-400 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded font-mono">
            <Command className="w-3 h-3" /> K
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Actions</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121428] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => { setActiveView("announcements"); setShowQuickMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#41E5FF]" />
                <span>Create Announcement</span>
              </button>
              <button 
                onClick={() => { setActiveView("past-questions"); setShowQuickMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Add Past Question</span>
              </button>
              <button 
                onClick={() => { setActiveView("ai-models"); setShowQuickMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
              >
                <Command className="w-4 h-4 text-emerald-400" />
                <span>Configure AI Models</span>
              </button>
            </div>
          )}
        </div>

        {/* Switch to Student View */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors"
          title="Switch to Student Dashboard"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#41E5FF]" />
          <span className="hidden sm:inline">Student View</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#41E5FF] shadow-[0_0_8px_#41E5FF]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#121428] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">System Alerts</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold">2 New</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <p className="font-semibold text-white">OpenAI Provider Latency Spike</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">Response times increased to 1.4s (resolved automatically).</p>
                  <span className="text-[10px] text-gray-500 mt-1 block">10 mins ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <p className="font-semibold text-white">New Enterprise Inquiry</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">University of Lagos requested custom LLM fine-tuning.</p>
                  <span className="text-[10px] text-gray-500 mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Admin Badge */}
        <div 
          onClick={() => setActiveView("profile")}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#41E5FF] flex items-center justify-center text-white font-bold text-xs">
            {user?.user_metadata?.full_name?.charAt(0) || "A"}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">
              {user?.user_metadata?.full_name?.split(" ")[0] || "Admin"}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-2.5 h-2.5" /> Superuser
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

