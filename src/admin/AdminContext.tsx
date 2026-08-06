import React, { createContext, useContext, useState } from "react";

export type AdminViewType = 
  | "dashboard"
  | "users"
  | "ai-models"
  | "content"
  | "announcements"
  | "analytics"
  | "subscriptions"
  | "system-health"
  | "settings"
  | "profile"
  | "past-questions"
  | "support"
  | "feature-flags";

interface AdminContextType {
  activeView: AdminViewType;
  setActiveView: (view: AdminViewType) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AdminViewType>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <AdminContext.Provider
      value={{
        activeView,
        setActiveView,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        searchQuery,
        setSearchQuery,
        isMobileOpen,
        setIsMobileOpen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
