import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  BookOpen, 
  FileText, 
  BarChart3, 
  CreditCard, 
  LifeBuoy, 
  Megaphone, 
  Flag, 
  Activity, 
  Settings, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import type { AdminViewType } from "../AdminContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavItem {
  id: AdminViewType;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users, badge: "1.2k" },
  { id: "ai-models", label: "AI Models", icon: Cpu },
  { id: "content", label: "Study Resources", icon: BookOpen },
  { id: "past-questions", label: "Past Questions", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "support", label: "Support", icon: LifeBuoy, badge: "3" },
  { id: "feature-flags", label: "Feature Flags", icon: Flag },
  { id: "system-health", label: "System Health", icon: Activity, badge: "99.9%" },
];

const secondaryNavItems: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "profile", label: "Admin Profile", icon: User },
];

export const AdminSidebar: React.FC = () => {
  const { activeView, setActiveView, isSidebarCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useAdmin();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarVariants = {
    expanded: { width: "260px" },
    collapsed: { width: "80px" },
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 bottom-0 z-50 bg-[#0A0C14]/95 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between select-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform lg:transition-none`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-18 px-5 flex items-center justify-between border-b border-white/[0.08]">
            <div 
              className="flex items-center gap-3 cursor-pointer overflow-hidden" 
              onClick={() => setActiveView("dashboard")}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#9333EA] to-[#41E5FF] p-[1px] shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <div className="w-full h-full bg-[#0d1024] rounded-[11px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#41E5FF]" />
                </div>
              </div>
              
              {!isSidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg tracking-tight text-white">Prime</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#7C3AED]/30 text-[#41E5FF] border border-[#7C3AED]/40">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">Control Center</span>
                </motion.div>
              )}
            </div>

            {/* Collapse toggle (Desktop) */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="py-4 px-3 space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
            {!isSidebarCollapsed && (
              <div className="px-3 pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Management
              </div>
            )}

            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-[#7C3AED]/25 to-[#41E5FF]/10 text-white border border-[#7C3AED]/40 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? "text-[#41E5FF]" : "text-gray-400 group-hover:text-gray-200"
                  }`} />
                  
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {!isSidebarCollapsed && item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge.includes("%") 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/10 text-gray-300"
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-[#41E5FF] rounded-r-full shadow-[0_0_8px_#41E5FF]"
                    />
                  )}
                </button>
              );
            })}

            {!isSidebarCollapsed && (
              <div className="px-3 pt-4 pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                System & Account
              </div>
            )}

            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-[#7C3AED]/25 to-[#41E5FF]/10 text-white border border-[#7C3AED]/40 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? "text-[#41E5FF]" : "text-gray-400 group-hover:text-gray-200"
                  }`} />
                  
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-[#41E5FF] rounded-r-full shadow-[0_0_8px_#41E5FF]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Admin Info & Logout */}
        <div className="p-3 border-t border-white/[0.08] bg-black/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#41E5FF] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "A"}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold text-white truncate">
                    {user?.user_metadata?.full_name || "System Admin"}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {user?.email || "admin@prime.ai"}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

