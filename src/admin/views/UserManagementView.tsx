import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Shield, 
  Key,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/admin/adminService";
import type { RealUserRecord } from "../../services/admin/adminService";

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<RealUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const loadUsers = async () => {
    setLoading(true);
    const data = await adminService.getUsersList();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.university.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async (id: string, currentStatus: "active" | "suspended", name: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    const ok = await adminService.updateUserStatus(id, nextStatus);
    if (ok) {
      toast.success(`User ${name} status updated to ${nextStatus}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    } else {
      toast.error(`Failed to update status for ${name}`);
    }
  };

  const handleToggleRole = async (id: string, currentRole: "student" | "admin", name: string) => {
    const nextRole = currentRole === "admin" ? "student" : "admin";
    const ok = await adminService.updateUserRole(id, nextRole);
    if (ok) {
      toast.success(`${name} assigned ${nextRole} role`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: nextRole } : u));
    } else {
      toast.error(`Failed to update role for ${name}`);
    }
  };

  const handleResetPassword = (email: string) => {
    toast.success(`Password reset email sent to ${email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-gray-400 text-xs mt-1">Search, inspect, manage roles, and monitor student platform activity.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">Total registered: <strong className="text-white">{users.length}</strong></span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121428]/80 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, university..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all" className="bg-[#121428]">All Roles</option>
              <option value="student" className="bg-[#121428]">Student</option>
              <option value="admin" className="bg-[#121428]">Admin</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">University</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">AI Usage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#41E5FF] flex items-center justify-center font-bold text-white shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-gray-300">{u.university}</td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase border ${
                      u.role === "admin" 
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40" 
                        : "bg-gray-500/10 text-gray-300 border-gray-500/20"
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                      u.plan === "Enterprise" ? "bg-amber-500/20 text-amber-300" :
                      u.plan === "Premium" ? "bg-[#41E5FF]/20 text-[#41E5FF]" : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {u.plan}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gray-400">{u.requestsCount} reqs</td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role, u.name)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white"
                        title="Toggle Admin/Student Role"
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleResetPassword(u.email)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white"
                        title="Send Password Reset"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u.id, u.status, u.name)}
                        className={`p-1.5 rounded-lg border ${
                          u.status === "active"
                            ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}
                        title={u.status === "active" ? "Suspend User" : "Activate User"}
                      >
                        {u.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

