import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, MailCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const EmailVerification = () => {
  const location = useLocation();
  const { resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const email = (location.state as any)?.email || '';

  const handleResend = async () => {
    if (!email) {
      toast.error('No email address provided. Please return to login.');
      return;
    }
    setIsResending(true);
    const { error } = await resendVerificationEmail(email);
    setIsResending(false);

    if (error) {
      toast.error(error.message || 'Failed to resend verification email');
    } else {
      toast.success('Verification email sent!');
    }
  };

  return (
    <div className="min-h-screen bg-[#070816] text-primary-text flex items-center justify-center font-sans selection:bg-primary/30 p-6">
      
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7C3AED]/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#41E5FF]/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#0d1024]/80 backdrop-blur-2xl rounded-3xl border border-divider p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden z-10 text-center flex flex-col items-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-3xl" />
        
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Logo Header */}
          <Link to="/" className="flex items-center gap-3 mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#41E5FF] p-[1px] overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <div className="absolute inset-0 bg-[#0d1024] rounded-xl m-[1px] flex items-center justify-center z-10">
                <Layers className="w-6 h-6 text-transparent bg-clip-text" style={{ stroke: 'url(#logo-gradient)' }} />
              </div>
              <svg width="0" height="0">
                <linearGradient id="logo-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop stopColor="#7C3AED" offset="0%" />
                  <stop stopColor="#41E5FF" offset="100%" />
                </linearGradient>
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">Prime</span>
          </Link>

          <div className="w-20 h-20 bg-gradient-to-br from-[#7C3AED]/20 to-[#41E5FF]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <MailCheck className="w-10 h-10 text-[#41E5FF]" />
          </div>

          <h2 className="text-3xl font-bold mb-4 tracking-tight">Check your email</h2>
          
          <p className="text-secondary-text text-sm leading-relaxed mb-6 px-4">
            We've sent a verification link to {email ? <strong className="text-primary-text">{email}</strong> : 'your email address'}. Please click the link to verify your account and continue to your dashboard.
          </p>

          {email && (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="mb-6 px-4 py-2 rounded-xl bg-card-hover border border-divider hover:border-white/20 text-xs font-semibold text-primary-text flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Resending...' : 'Resend Verification Email'}
            </button>
          )}

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          <Link 
            to="/login"
            className="flex items-center gap-2 text-sm text-secondary-text hover:text-primary-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

        </div>
      </motion.div>
    </div>
  );
};

