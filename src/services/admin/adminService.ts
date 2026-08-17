import { supabase } from "../../lib/supabaseClient";

export interface RealUserRecord {
  id: string;
  name: string;
  email: string;
  university: string;
  role: "student" | "admin";
  status: "active" | "suspended";
  plan: "Free" | "Premium" | "Enterprise";
  joinedDate: string;
  requestsCount: number;
}

export interface AdminOverviewMetrics {
  totalUsers: number;
  activeUsersToday: number;
  aiRequestsToday: number;
  totalPdfs: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalUsage: number;
  premiumSubscribers: number;
  monthlyRevenue: number;
}

export interface AnalyticsData {
  dauGrowth: Array<{ day: string; value: number }>;
  featureBreakdown: Array<{ name: string; percentage: number; count: number; color: string }>;
  totalRequests: number;
  successRate: number;
}

export interface FeatureFlagRecord {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: "Production" | "Staging" | "Beta";
  rolloutPercentage: number;
}

export interface SystemSettingsRecord {
  site_name: string;
  enable_signup: boolean;
  require_email_verification: boolean;
  maintenance_mode: boolean;
  global_announcement: string;
  primary_model: string;
  fallback_model: string;
  daily_request_limit: number;
  monthly_request_limit: number;
  premium_monthly_price: number;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  target: "All Students" | "Premium Only" | "Free Tier";
  status: "Active" | "Scheduled" | "Archived";
  date: string;
}

export interface AuditLogRecord {
  id: string;
  admin_email: string;
  action: string;
  target: string;
  details: string;
  created_at: string;
}

export interface StudyResourceRecord {
  id: string;
  title: string;
  category: "Past Question" | "Course Material" | "Study Guide";
  university: string;
  downloads: number;
  uploaded_at?: string;
  created_at?: string;
}

export interface SupportTicketRecord {
  id: string;
  user_id?: string;
  student_name: string;
  email: string;
  subject: string;
  category: "Billing" | "Technical" | "AI Engine" | "Account";
  priority: "Urgent" | "High" | "Normal";
  status: "Open" | "In Progress" | "Resolved";
  created_at: string;
  message: string;
  admin_reply?: string;
}

/**
 * Service providing real administrative metrics, user management, feature flags, system settings,
 * announcements, and audit logging backed by Supabase.
 */
export const adminService = {
  /**
   * Fetches aggregated overview metrics from Supabase database tables.
   */
  async getOverviewMetrics(): Promise<AdminOverviewMetrics> {
    try {
      const { count: totalUsersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayISO = todayStart.toISOString();

      const { count: activeUsersTodayCount } = await supabase
        .from("ai_usage")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", todayISO);

      const { count: aiRequestsTodayCount } = await supabase
        .from("ai_usage")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayISO);

      const { count: totalUsageCount } = await supabase
        .from("ai_usage")
        .select("*", { count: "exact", head: true });

      const { count: totalPdfsCount } = await supabase
        .from("study_materials")
        .select("*", { count: "exact", head: true });

      const { count: totalFlashcardsCount } = await supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true });

      const { count: totalQuizzesCount } = await supabase
        .from("quiz_results")
        .select("*", { count: "exact", head: true });

      // 7. Subscriptions & Pricing from System Settings
      const settings = await this.getSystemSettings();
      const price = settings.premium_monthly_price ?? 10;

      const { count: premiumCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .neq("plan", "free");

      return {
        totalUsers: totalUsersCount || 0,
        activeUsersToday: activeUsersTodayCount || 0,
        aiRequestsToday: aiRequestsTodayCount || 0,
        totalPdfs: totalPdfsCount || 0,
        totalFlashcards: totalFlashcardsCount || 0,
        totalQuizzes: totalQuizzesCount || 0,
        totalUsage: totalUsageCount || 0,
        premiumSubscribers: premiumCount || 0,
        monthlyRevenue: (premiumCount || 0) * price,
      };
    } catch (error) {
      console.error("Failed to fetch admin overview metrics:", error);
      return {
        totalUsers: 0,
        activeUsersToday: 0,
        aiRequestsToday: 0,
        totalPdfs: 0,
        totalFlashcards: 0,
        totalQuizzes: 0,
        totalUsage: 0,
        premiumSubscribers: 0,
        monthlyRevenue: 0,
      };
    }
  },

  /**
   * Fetches real subscription tier metrics and pricing/limit configuration from Supabase.
   */
  async getSubscriptionMetrics() {
    try {
      // 1. Total Free Tier Students
      const { count: freeCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .or("plan.eq.free,plan.is.null")
        .eq("status", "active");

      // Count profiles with no subscription record at all as free tier
      const { count: totalProfiles } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: totalSubs } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true });

      const missingSubCount = Math.max(0, (totalProfiles || 0) - (totalSubs || 0));
      const actualFreeCount = (freeCount || 0) + missingSubCount;

      // 2. Active Premium Pro Subscribers
      const { count: premiumCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .ilike("plan", "%premium%")
        .eq("status", "active");

      // 3. Enterprise Accounts
      const { count: enterpriseCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .ilike("plan", "%enterprise%")
        .eq("status", "active");

      // 4. Read system settings for limits & price
      const settings = await this.getSystemSettings();
      const dailyLimit = settings.daily_request_limit ?? 50;
      const premiumPrice = settings.premium_monthly_price ?? 10;

      // Calculate MRR (configured monthly price per active premium subscriber)
      const activePremium = premiumCount || 0;
      const mrr = activePremium * premiumPrice;

      return {
        freeCount: actualFreeCount,
        premiumCount: activePremium,
        enterpriseCount: enterpriseCount || 0,
        mrr,
        dailyLimit,
        premiumPrice,
      };
    } catch (error) {
      console.error("Failed to fetch subscription metrics:", error);
      return {
        freeCount: 0,
        premiumCount: 0,
        enterpriseCount: 0,
        mrr: 0,
        dailyLimit: 50,
        premiumPrice: 10,
      };
    }
  },

  /**
   * Fetches real user list from Supabase profiles table.
   */
  async getUsersList(): Promise<RealUserRecord[]> {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, university, role, is_admin, status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!profiles || profiles.length === 0) return [];

      const { data: usageLogs } = await supabase
        .from("ai_usage")
        .select("user_id");

      const usageCountMap: Record<string, number> = {};
      if (usageLogs) {
        for (const log of usageLogs) {
          usageCountMap[log.user_id] = (usageCountMap[log.user_id] || 0) + 1;
        }
      }

      const { data: subs } = await supabase
        .from("subscriptions")
        .select("user_id, plan");

      const subMap: Record<string, "Free" | "Premium" | "Enterprise"> = {};
      if (subs) {
        for (const sub of subs) {
          const rawPlan = (sub.plan || "free").toLowerCase();
          subMap[sub.user_id] = rawPlan.includes("enterprise") ? "Enterprise" : rawPlan.includes("premium") ? "Premium" : "Free";
        }
      }

      return profiles.map((p) => ({
        id: p.id,
        name: p.full_name || "Student User",
        email: `id_${p.id.slice(0, 8)}@prime-ai.edu`,
        university: p.university || "University",
        role: p.is_admin || p.role === "admin" ? "admin" : "student",
        status: (p.status as "active" | "suspended") || "active",
        plan: subMap[p.id] || "Free",
        joinedDate: p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : "2026-08-01",
        requestsCount: usageCountMap[p.id] || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch real user list:", error);
      return [];
    }
  },

  /**
   * Updates user role (admin <-> student) in Supabase and logs action.
   */
  async updateUserRole(userId: string, newRole: "student" | "admin"): Promise<boolean> {
    try {
      const isAdmin = newRole === "admin";
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, is_admin: isAdmin })
        .eq("id", userId);

      if (error) throw error;
      await this.logAuditAction("UPDATE_ROLE", userId, `Changed role to ${newRole}`);
      return true;
    } catch (error) {
      console.error("Failed to update user role:", error);
      return false;
    }
  },

  /**
   * Updates user account status (active <-> suspended) in Supabase and logs action.
   */
  async updateUserStatus(userId: string, newStatus: "active" | "suspended"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;
      await this.logAuditAction("UPDATE_STATUS", userId, `Changed status to ${newStatus}`);
      return true;
    } catch (error) {
      console.error("Failed to update user status:", error);
      return false;
    }
  },

  /**
   * Updates subscription plan for a user in Supabase.
   */
  async updateUserPlan(userId: string, newPlan: "free" | "premium" | "enterprise"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .upsert({ user_id: userId, plan: newPlan, status: "active" }, { onConflict: "user_id" });

      if (error) throw error;
      await this.logAuditAction("UPDATE_SUBSCRIPTION", userId, `Changed plan to ${newPlan}`);
      return true;
    } catch (error) {
      console.error("Failed to update user plan:", error);
      return false;
    }
  },

  /**
   * Fetches real analytics data for charts.
   */
  async getAnalyticsData(daysLimit: number = 7): Promise<AnalyticsData> {
    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - daysLimit);

      const { data: usageData, error } = await supabase
        .from("ai_usage")
        .select("feature_name, success, created_at")
        .gte("created_at", sinceDate.toISOString());

      if (error) throw error;

      const featureCounts: Record<string, number> = {};
      let totalReqs = 0;
      let successCount = 0;

      const dayMap: Record<string, number> = {};
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = daysLimit - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = dayNames[d.getDay()];
        dayMap[dayLabel] = 0;
      }

      if (usageData) {
        totalReqs = usageData.length;
        for (const row of usageData) {
          if (row.success !== false) successCount++;
          const fName = row.feature_name || "AI Tutor";
          featureCounts[fName] = (featureCounts[fName] || 0) + 1;

          if (row.created_at) {
            const d = new Date(row.created_at);
            const dayLabel = dayNames[d.getDay()];
            if (dayMap[dayLabel] !== undefined) {
              dayMap[dayLabel]++;
            }
          }
        }
      }

      const dauGrowth = Object.keys(dayMap).map((day) => ({
        day,
        value: dayMap[day],
      }));

      const colors = ["bg-purple-500", "bg-cyan-400", "bg-emerald-400", "bg-amber-400", "bg-indigo-500"];
      const featureNames = Object.keys(featureCounts);
      const featureBreakdown = featureNames.map((name, i) => {
        const count = featureCounts[name];
        const percentage = totalReqs > 0 ? Math.round((count / totalReqs) * 100) : 0;
        return {
          name,
          percentage,
          count,
          color: colors[i % colors.length],
        };
      });

      const successRate = totalReqs > 0 ? Math.round((successCount / totalReqs) * 100) : 100;

      return {
        dauGrowth,
        featureBreakdown,
        totalRequests: totalReqs,
        successRate,
      };
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      return {
        dauGrowth: [
          { day: "Mon", value: 0 },
          { day: "Tue", value: 0 },
          { day: "Wed", value: 0 },
          { day: "Thu", value: 0 },
          { day: "Fri", value: 0 },
          { day: "Sat", value: 0 },
          { day: "Sun", value: 0 },
        ],
        featureBreakdown: [],
        totalRequests: 0,
        successRate: 100,
      };
    }
  },

  /**
   * Fetches feature flags from Supabase system_settings or defaults.
   */
  async getFeatureFlags(): Promise<FeatureFlagRecord[]> {
    const defaultFlags: FeatureFlagRecord[] = [
      { id: "ff_1", key: "ai_tutor", name: "AI Tutor", description: "Interactive study companion and step-by-step solver.", enabled: true, environment: "Production", rolloutPercentage: 100 },
      { id: "ff_2", key: "study_summarizer", name: "Study/PDF Summarizer", description: "Executive summaries and study questions from lecture notes.", enabled: true, environment: "Production", rolloutPercentage: 100 },
      { id: "ff_3", key: "flashcards", name: "Flashcard Generator", description: "Spaced repetition flashcard extraction from study materials.", enabled: true, environment: "Production", rolloutPercentage: 100 },
      { id: "ff_4", key: "image_solver", name: "Image & Homework Solver", description: "OCR and vision-based step-by-step assignment helper.", enabled: true, environment: "Production", rolloutPercentage: 100 },
      { id: "ff_5", key: "quiz_generator", name: "Quiz/Exam Generator", description: "Custom practice quizzes with explanations.", enabled: true, environment: "Production", rolloutPercentage: 100 },
      { id: "ff_6", key: "past_questions", name: "Past Questions Assistant", description: "University exam archive search and solution breakdown.", enabled: true, environment: "Production", rolloutPercentage: 100 },
    ];

    try {
      const { data } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "feature_flags")
        .maybeSingle();

      if (data?.value && Array.isArray(data.value)) {
        return data.value as FeatureFlagRecord[];
      }
    } catch {
      // Fallback to default flags if table or key doesn't exist yet
    }

    return defaultFlags;
  },

  /**
   * Saves feature flags to Supabase system_settings.
   */
  async saveFeatureFlags(flags: FeatureFlagRecord[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("system_settings")
        .upsert({ key: "feature_flags", value: flags, updated_at: new Date().toISOString() }, { onConflict: "key" });

      if (error) throw error;
      await this.logAuditAction("UPDATE_FEATURE_FLAGS", "system", `Updated ${flags.length} feature flags`);
      return true;
    } catch (error) {
      console.error("Failed to save feature flags:", error);
      return false;
    }
  },

  /**
   * Fetches global system settings from Supabase.
   */
  async getSystemSettings(): Promise<SystemSettingsRecord> {
    const defaultSettings: SystemSettingsRecord = {
      site_name: "Prime AI",
      enable_signup: true,
      require_email_verification: true,
      maintenance_mode: false,
      global_announcement: "",
      primary_model: "gpt-4o",
      fallback_model: "gpt-4o-mini",
      daily_request_limit: 50,
      monthly_request_limit: 1000,
      premium_monthly_price: 10,
    };

    try {
      const { data } = await supabase
        .from("system_settings")
        .select("key, value");

      if (data && data.length > 0) {
        const settings = { ...defaultSettings };
        for (const item of data) {
          if (item.key in settings) {
            (settings as any)[item.key] = item.value;
          }
        }
        return settings;
      }
    } catch {
      // Fallback to defaults
    }

    return defaultSettings;
  },

  /**
   * Saves a single system setting key/value pair to Supabase.
   */
  async saveSystemSetting(key: string, value: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("system_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

      if (error) throw error;
      await this.logAuditAction("UPDATE_SYSTEM_SETTING", key, `Updated setting ${key} to ${JSON.stringify(value)}`);
      return true;
    } catch (error) {
      console.error(`Failed to save system setting ${key}:`, error);
      return false;
    }
  },

  /**
   * Fetches announcements from Supabase.
   */
  async getAnnouncements(): Promise<AnnouncementRecord[]> {
    try {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        return data.map((a) => ({
          id: a.id,
          title: a.title,
          message: a.message,
          target: a.target || "All Students",
          status: a.status || "Active",
          date: a.created_at ? new Date(a.created_at).toISOString().split("T")[0] : "2026-08-01",
        }));
      }
    } catch {
      // Fallback
    }
    return [
      { id: "anc_1", title: "🚀 Welcome to Prime AI", message: "Explore your AI study workspace with step-by-step problem solver and lecture summarizer.", target: "All Students", status: "Active", date: "2026-08-01" }
    ];
  },

  /**
   * Creates a new broadcast announcement.
   */
  async createAnnouncement(title: string, message: string, target: "All Students" | "Premium Only" | "Free Tier"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("announcements")
        .insert({ title, message, target, status: "Active" });

      if (error) throw error;
      await this.logAuditAction("CREATE_ANNOUNCEMENT", target, `Broadcasting: ${title}`);
      return true;
    } catch (error) {
      console.error("Failed to create announcement:", error);
      return false;
    }
  },

  /**
   * Deletes an announcement.
   */
  async deleteAnnouncement(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await this.logAuditAction("DELETE_ANNOUNCEMENT", id, `Removed announcement ${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      return false;
    }
  },

  /**
   * Fetches study resources & past questions from public.study_resources
   */
  async getStudyResources(): Promise<StudyResourceRecord[]> {
    try {
      const { data, error } = await supabase
        .from("study_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) return data as StudyResourceRecord[];
    } catch (err) {
      console.error("Failed to fetch study resources:", err);
    }
    return [];
  },

  /**
   * Creates a new study resource / past question entry in public.study_resources
   */
  async createStudyResource(resource: Omit<StudyResourceRecord, "id">): Promise<StudyResourceRecord | null> {
    try {
      const { data, error } = await supabase
        .from("study_resources")
        .insert({
          title: resource.title,
          category: resource.category,
          university: resource.university,
          downloads: resource.downloads || 0,
        })
        .select()
        .single();

      if (error) throw error;
      await this.logAuditAction("CREATE_STUDY_RESOURCE", resource.university, `Created resource: ${resource.title}`);
      return data as StudyResourceRecord;
    } catch (err) {
      console.error("Failed to create study resource:", err);
      return null;
    }
  },

  /**
   * Deletes a study resource from public.study_resources
   */
  async deleteStudyResource(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("study_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await this.logAuditAction("DELETE_STUDY_RESOURCE", id, `Deleted resource ${id}`);
      return true;
    } catch (err) {
      console.error("Failed to delete study resource:", err);
      return false;
    }
  },

  /**
   * Fetches support tickets from public.support_tickets
   */
  async getSupportTickets(): Promise<SupportTicketRecord[]> {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) return data as SupportTicketRecord[];
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    }
    return [];
  },

  /**
   * Updates support ticket status and/or appends an admin reply
   */
  async updateSupportTicket(id: string, status: "Open" | "In Progress" | "Resolved", adminReply?: string): Promise<boolean> {
    try {
      const updateData: any = { status };
      if (adminReply) {
        updateData.admin_reply = adminReply;
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      await this.logAuditAction("UPDATE_SUPPORT_TICKET", id, `Marked ticket ${id} as ${status}${adminReply ? ' with reply' : ''}`);
      return true;
    } catch (err) {
      console.error("Failed to update support ticket:", err);
      return false;
    }
  },

  /**
   * Fetches audit logs from Supabase.
   */
  async getAuditLogs(): Promise<AuditLogRecord[]> {
    try {
      const { data } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        return data as AuditLogRecord[];
      }
    } catch {
      // Fallback
    }
    return [];
  },

  /**
   * Records an admin action into admin_audit_logs.
   */
  async logAuditAction(action: string, target: string, details: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = session?.user?.email || "admin@prime.ai";
      await supabase.from("admin_audit_logs").insert({
        admin_email: adminEmail,
        action,
        target,
        details,
      });
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  },
};


