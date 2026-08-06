import React from "react";
import { AdminProvider, useAdmin } from "./AdminContext";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminTopBar } from "./components/AdminTopBar";
import { AdminOverview } from "./views/AdminOverview";
import { UserManagementView } from "./views/UserManagementView";
import { AIModelsView } from "./views/AIModelsView";
import { ContentManagementView } from "./views/ContentManagementView";
import { AnnouncementsView } from "./views/AnnouncementsView";
import { AnalyticsView } from "./views/AnalyticsView";
import { SubscriptionsView } from "./views/SubscriptionsView";
import { SystemHealthView } from "./views/SystemHealthView";
import { SettingsView } from "./views/SettingsView";
import { GenericAdminView } from "./views/GenericAdminView";

const AdminContent: React.FC = () => {
  const { activeView, isSidebarCollapsed } = useAdmin();

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <AdminOverview />;
      case "users":
        return <UserManagementView />;
      case "ai-models":
        return <AIModelsView />;
      case "content":
      case "past-questions":
        return <ContentManagementView />;
      case "announcements":
        return <AnnouncementsView />;
      case "analytics":
        return <AnalyticsView />;
      case "subscriptions":
        return <SubscriptionsView />;
      case "system-health":
        return <SystemHealthView />;
      case "settings":
        return <SettingsView />;
      case "profile":
        return <GenericAdminView title="Admin Profile" description="Manage your superuser administrator credentials and security tokens." />;
      case "support":
        return <GenericAdminView title="Student Support Tickets" description="Review student inquiries and respond to helpdesk tickets." />;
      case "feature-flags":
        return <GenericAdminView title="Feature Flags & Experiments" description="Enable or disable experimental features in student dashboards." />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070816] text-white selection:bg-[#7C3AED] selection:text-white font-sans antialiased">
      <AdminSidebar />
      <AdminTopBar />
      
      <main className={`p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
        isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
};

