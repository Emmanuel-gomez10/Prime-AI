import React, { useState, useEffect } from "react";
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  Clock, 
  Send, 
  User, 
  X,
  RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/admin/adminService";
import type { SupportTicketRecord } from "../../services/admin/adminService";

export const SupportView: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    const data = await adminService.getSupportTickets();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openTicketsCount = tickets.filter(t => t.status === "Open").length;

  const handleStatusChange = async (id: string, newStatus: SupportTicketRecord["status"]) => {
    const success = await adminService.updateSupportTicket(id, newStatus);
    if (success) {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      toast.success(`Ticket status updated to ${newStatus}`);
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      toast.error("Failed to update ticket status");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsSubmitting(true);
    const success = await adminService.updateSupportTicket(selectedTicket.id, "In Progress", replyText);
    setIsSubmitting(false);

    if (success) {
      toast.success(`Reply sent to ${selectedTicket.email}`);
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: "In Progress", admin_reply: replyText } : t));
      if (selectedTicket) {
        setSelectedTicket(prev => prev ? { ...prev, status: "In Progress", admin_reply: replyText } : null);
      }
      setReplyText("");
    } else {
      toast.error("Failed to send reply.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-[#41E5FF]" /> Student Support & Helpdesk
          </h1>
          <p className="text-gray-400 text-xs mt-1">Review student inquiries, resolve billing issues, and manage ticket queues.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTickets}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {openTicketsCount} Open Ticket{openTicketsCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by ID, name, or subject..."
            className="w-full bg-[#070816] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          {["All", "Open", "In Progress", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === status
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white shadow-lg"
                  : "bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List Table */}
      <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#070816]/60 text-gray-400 font-semibold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Subject & Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#41E5FF]" />
                    Loading support tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No support tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{t.id.slice(0, 8)}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{t.student_name}</div>
                      <div className="text-[10px] text-gray-400">{t.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white truncate max-w-xs">{t.subject}</div>
                      <span className="text-[10px] bg-white/[0.06] text-gray-400 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.priority === "Urgent" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                        t.priority === "High" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === "Resolved" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                        t.status === "In Progress" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                        "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium border border-purple-500/30 transition-all"
                      >
                        View & Reply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121428] border border-white/10 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#41E5FF] flex items-center justify-center text-white font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{selectedTicket.subject}</h3>
                <p className="text-xs text-gray-400">{selectedTicket.student_name} ({selectedTicket.email}) • {selectedTicket.id.slice(0, 8)}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070816]/70 border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Student Message</span>
              <p className="text-xs text-gray-200 leading-relaxed">{selectedTicket.message}</p>
            </div>

            {selectedTicket.admin_reply && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Previous Admin Response</span>
                <p className="text-xs text-purple-200 leading-relaxed">{selectedTicket.admin_reply}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Mark Status:</span>
                {(["Open", "In Progress", "Resolved"] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedTicket.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedTicket.status === st
                        ? "bg-[#7C3AED] text-white"
                        : "bg-white/[0.05] text-gray-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your official administrative support response..."
                className="w-full bg-[#070816] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED]"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold flex items-center gap-2 shadow-lg hover:opacity-90"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

