import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Send, Clock, CheckCircle2, MessageSquare, AlertCircle, RefreshCw, Plus, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { dbService } from '../../../services/db/databaseService';

interface StudentTicket {
  id: string;
  user_id: string;
  student_name: string;
  email: string;
  subject: string;
  category: 'Billing' | 'Technical' | 'AI Engine' | 'Account';
  priority: 'Urgent' | 'High' | 'Normal';
  status: 'Open' | 'In Progress' | 'Resolved';
  message: string;
  admin_reply?: string;
  created_at: string;
}

export const StudentSupportView: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<StudentTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'Billing' | 'Technical' | 'AI Engine' | 'Account'>('Technical');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal'>('Normal');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTickets = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await dbService.fetchStudentTickets(user.id);
    if (data) {
      setTickets(data as StudentTicket[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, [user?.id]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Please fill in both the subject and message fields.' });
      return;
    }

    if (!user?.id) {
      setFeedback({ type: 'error', text: 'You must be logged in to submit a ticket.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const rawName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
    const studentName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const email = user?.email || 'student@prime.ai';

    const created = await dbService.createSupportTicket({
      user_id: user.id,
      student_name: studentName,
      email,
      subject,
      category,
      priority,
      message,
    });

    setIsSubmitting(false);

    if (created) {
      setFeedback({ type: 'success', text: 'Support ticket submitted successfully! Our team will review it shortly.' });
      setSubject('');
      setMessage('');
      setCategory('Technical');
      setPriority('Normal');
      setShowCreateModal(false);
      loadTickets();
    } else {
      setFeedback({ type: 'error', text: 'Failed to submit support ticket. Please try again.' });
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 h-full flex flex-col overflow-y-auto scrollbar-hide pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-6 shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-[#41E5FF]" /> Support & Help Center
          </h2>
          <p className="text-secondary-text text-[14px]">Need help? Tell us what's going on and our support team will get back to you.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTickets}
            disabled={loading}
            className="p-2.5 rounded-xl bg-surface hover:bg-card-hover text-secondary-text hover:text-primary-text border border-divider transition-all"
            aria-label="Refresh support tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-text font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Support Ticket</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`mb-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-divider rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
          >
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-secondary-text hover:text-primary-text"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-primary-text flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Create Support Ticket
            </h3>

            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="text-secondary-text block mb-1 font-medium">Subject <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summarize your issue..."
                  className="w-full bg-background border border-divider rounded-xl px-3 py-2 text-primary-text focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-secondary-text block mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-background border border-divider rounded-xl px-3 py-2 text-primary-text focus:outline-none focus:border-primary"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="AI Engine">AI Engine</option>
                    <option value="Account">Account</option>
                  </select>
                </div>

                <div>
                  <label className="text-secondary-text block mb-1 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-background border border-divider rounded-xl px-3 py-2 text-primary-text focus:outline-none focus:border-primary"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-secondary-text block mb-1 font-medium">Message <span className="text-rose-400">*</span></label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you were doing and what error occurred..."
                  className="w-full bg-background border border-divider rounded-xl p-3 text-primary-text focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-card-hover text-secondary-text font-semibold hover:text-primary-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-primary-text font-bold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Ticket History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary-text tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" /> My Support Tickets
        </h3>

        {loading ? (
          <div className="p-12 text-center text-secondary-text rounded-2xl bg-surface border border-divider">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading your support tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface border border-divider space-y-3">
            <LifeBuoy className="w-10 h-10 text-secondary-text mx-auto opacity-50" />
            <h4 className="text-base font-bold text-primary-text">No support tickets yet</h4>
            <p className="text-xs sm:text-sm text-secondary-text max-w-md mx-auto">
              If you run into any issues with study materials, flashcards, or AI responses, submit a support ticket above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={t.id}
                className="p-5 rounded-2xl bg-surface border border-divider shadow-lg space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{t.id.slice(0, 8)}</span>
                    <h4 className="font-bold text-primary-text text-sm sm:text-base">{t.subject}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-card-hover text-secondary-text">
                      {t.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      t.status === 'In Progress' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-secondary-text leading-relaxed whitespace-pre-wrap">{t.message}</p>

                {t.admin_reply && (
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Official Administrative Response</span>
                    <p className="text-xs sm:text-sm text-primary-text leading-relaxed">{t.admin_reply}</p>
                  </div>
                )}

                <div className="text-[11px] text-secondary-text text-right">
                  Submitted: {t.created_at ? new Date(t.created_at).toLocaleString() : 'Recently'}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
