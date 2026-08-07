import React, { useState } from "react";
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  Clock, 
  Send, 
  User, 
  X 
} from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  studentName: string;
  email: string;
  subject: string;
  category: "Billing" | "Technical" | "AI Engine" | "Account";
  priority: "Urgent" | "High" | "Normal";
  status: "Open" | "In Progress" | "Resolved";
  date: string;
  message: string;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "TCK-8901",
    studentName: "Amara Chukwu",
    email: "amara.c@unizik.edu.ng",
    subject: "Flashcards export timing out on 500+ cards",
    category: "Technical",
    priority: "High",
    status: "Open",
    date: "2026-08-07 10:14 AM",
    message: "Whenever I try to export my 500-card Biochemistry deck to PDF, the screen freezes at 98% and throws a network error."
  },
  {
    id: "TCK-8902",
    studentName: "David Okon",
    email: "david.o@unilag.edu.ng",
    subject: "Premium annual subscription payment pending",
    category: "Billing",
    priority: "Urgent",
    status: "In Progress",
    date: "2026-08-07 09:30 AM",
    message: "Paystack charged my card for the annual plan but my dashboard still displays Free Tier status."
  },
  {
    id: "TCK-8903",
    studentName: "Blessing Adebayo",
    email: "blessing@covenantuniversity.edu.ng",
    subject: "Image Solver LaTeX math rendering question",
    category: "AI Engine",
    priority: "Normal",
    status: "Resolved",
    date: "2026-08-06 04:45 PM",
    message: "Can we copy LaTeX code straight out of the solver box into Overleaf? Yes, working now!"
  },
  {
    id: "TCK-8904",
    studentName: "Emmanuel Gomez",
    email: "eorji362@gmail.com",
    subject: "API Key rate limit inquiry for study group",
    category: "Account",
    priority: "Normal",
    status: "Open",
    date: "2026-08-06 02:15 PM",
    message: "We have 15 students sharing study decks. Do we need enterprise group quota?"
  }
];

export const SupportView: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: Ticket["status"]) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast.success(`Ticket ${id} marked as ${newStatus}`);
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    toast.success(`Reply sent to ${selectedTicket.email}`);
    handleStatusChange(selectedTicket.id, "In Progress");
    setReplyText("");
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
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> 2 Open Tickets
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
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{t.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{t.studentName}</div>
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
                  <td className="py-3.5 px-4 text-gray-400">{t.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium border border-purple-500/30 transition-all"
                    >
                      View & Reply
                    </button>
                  </td>
                </tr>
              ))}
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
                <p className="text-xs text-gray-400">{selectedTicket.studentName} ({selectedTicket.email}) • {selectedTicket.id}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070816]/70 border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Student Message</span>
              <p className="text-xs text-gray-200 leading-relaxed">{selectedTicket.message}</p>
            </div>

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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-white text-xs font-semibold flex items-center gap-2 shadow-lg hover:opacity-90"
                >
                  <Send className="w-3.5 h-3.5" />
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
