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

/**
 * Service providing real administrative metrics, user management, and AI analytics from Supabase.
 */
export const adminService = {
  /**
   * Fetches aggregated overview metrics from Supabase database tables.
   */
  async getOverviewMetrics(): Promise<AdminOverviewMetrics> {
    try {
      // 1. Total users & Active users
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

      // 2. AI Requests Today
      const { count: aiRequestsTodayCount } = await supabase
        .from("ai_usage")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayISO);

      // 3. Total AI Usage Records
      const { count: totalUsageCount } = await supabase
        .from("ai_usage")
        .select("*", { count: "exact", head: true });

      // 4. Total Uploaded PDFs (study_materials)
      const { count: totalPdfsCount } = await supabase
        .from("study_materials")
        .select("*", { count: "exact", head: true });

      // 5. Total Flashcards
      const { count: totalFlashcardsCount } = await supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true });

      // 6. Total Quizzes
      const { count: totalQuizzesCount } = await supabase
        .from("quiz_results")
        .select("*", { count: "exact", head: true });

      // 7. Subscriptions
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
        monthlyRevenue: (premiumCount || 0) * 10,
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

      // Fetch usage counts for each profile
      const { data: usageLogs } = await supabase
        .from("ai_usage")
        .select("user_id");

      const usageCountMap: Record<string, number> = {};
      if (usageLogs) {
        for (const log of usageLogs) {
          usageCountMap[log.user_id] = (usageCountMap[log.user_id] || 0) + 1;
        }
      }

      // Fetch subscription plans
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
   * Updates user role (admin <-> student) in Supabase.
   */
  async updateUserRole(userId: string, newRole: "student" | "admin"): Promise<boolean> {
    try {
      const isAdmin = newRole === "admin";
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, is_admin: isAdmin })
        .eq("id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to update user role:", error);
      return false;
    }
  },

  /**
   * Updates user account status (active <-> suspended) in Supabase.
   */
  async updateUserStatus(userId: string, newStatus: "active" | "suspended"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to update user status:", error);
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
};
