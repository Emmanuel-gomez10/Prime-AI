import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    const { error } = await resetPassword(data.email);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || 'Failed to send reset email');
    } else {
      setSuccessMessage(true);
      toast.success('Reset link sent to your email.');
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
        className="w-full max-w-md bg-[#0d1024]/80 backdrop-blur-2xl rounded-3xl border border-divider p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden z-10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-3xl" />
        
        <div className="relative z-10 flex flex-col items-center">
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
            <span className="text-2xl font-bold tracking-tight">Prime AI</span>
          </Link>

          <h2 className="text-2xl font-bold mb-2 tracking-tight text-center">Reset Password</h2>
          <p className="text-secondary-text text-sm mb-8 text-center">Enter your email address and we'll send you a link to reset your password.</p>

          {successMessage ? (
            <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center mb-6">
              Check your email for the password reset link. It may take a few minutes to arrive.
            </div>
          ) : (
            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit(onSubmit)}>
              
              <div className="flex flex-col gap-1">
                <div className="relative group">
                  <input 
                    type="email" 
                    id="email" 
                    placeholder=" "
                    {...register('email')}
                    className="block w-full px-4 pt-6 pb-2 text-sm text-primary-text bg-card-hover border border-divider rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-[#7C3AED] focus:bg-card-hover peer transition-all duration-300 shadow-inner"
                  />
                  <label 
                    htmlFor="email" 
                    className="absolute text-sm text-secondary-text duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#7C3AED]"
                  >
                    Email Address
                  </label>
                </div>
                {errors.email && <span className="text-red-400 text-xs ml-1">{errors.email.message}</span>}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="mt-2 relative inline-flex items-center justify-center px-6 py-4 text-sm font-semibold text-primary-text transition-all duration-300 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(124,58,237,0.4)] overflow-hidden group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70 disabled:pointer-events-none"
              >
                {!isSubmitting && <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />}
                <span className="relative flex items-center gap-2">
                  {isSubmitting && <div className="w-4 h-4 border-2 border-divider0 border-t-white rounded-full animate-spin" />}
                  {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                </span>
              </button>
            </form>
          )}

          <div className="mt-8 flex flex-col items-center gap-5 text-sm">
            <p className="text-secondary-text">
              Remember your password? <Link to="/login" className="text-[#41E5FF] hover:text-primary-text transition-colors font-medium relative after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-[1px] after:bg-[#41E5FF]/50 hover:after:bg-white/80">Log In</Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
