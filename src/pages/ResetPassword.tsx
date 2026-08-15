import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvalidLink, setIsInvalidLink] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  useEffect(() => {
    const hash = window.location.hash;
    const hasRecoveryParams = hash.includes('type=recovery') || hash.includes('access_token=') || window.location.search.includes('code=');
    
    if (!session && !hasRecoveryParams) {
      const timer = setTimeout(() => {
        setIsInvalidLink(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsInvalidLink(false);
    }
  }, [session]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    const { error } = await updatePassword(data.password);
    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to reset password. Link may have expired.');
    } else {
      toast.success('Password successfully reset. You can now log in with your new password.');
      navigate('/login');
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
          <div className="flex items-center gap-3 mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
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
          </div>

          <h2 className="text-2xl font-bold mb-2 tracking-tight text-center">Set New Password</h2>
          <p className="text-secondary-text text-sm mb-8 text-center">
            {isInvalidLink ? "Your password reset link is invalid or has expired." : "Please enter your new password below."}
          </p>

          {isInvalidLink ? (
            <div className="flex flex-col items-center gap-4 w-full text-center">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs w-full">
                This reset link is invalid, expired, or has already been used. Please request a new password reset link.
              </div>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="w-full px-6 py-3.5 text-sm font-semibold text-primary-text rounded-xl bg-[#7C3AED] hover:bg-[#7C3AED]/90 transition-all shadow-md"
              >
                Request New Reset Link
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit(onSubmit)}>
              
              <div className="flex flex-col gap-1">
                <div className="relative group">
                  <input 
                    type="password" 
                    id="password" 
                    placeholder=" "
                    {...register('password')}
                    className="block w-full px-4 pt-6 pb-2 text-sm text-primary-text bg-card-hover border border-divider rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-[#7C3AED] focus:bg-card-hover peer transition-all duration-300 shadow-inner"
                  />
                  <label 
                    htmlFor="password" 
                    className="absolute text-sm text-secondary-text duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#7C3AED]"
                  >
                    New Password
                  </label>
                </div>
                {errors.password && <span className="text-red-400 text-xs ml-1">{errors.password.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative group">
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    placeholder=" "
                    {...register('confirmPassword')}
                    className="block w-full px-4 pt-6 pb-2 text-sm text-primary-text bg-card-hover border border-divider rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-[#7C3AED] focus:bg-card-hover peer transition-all duration-300 shadow-inner"
                  />
                  <label 
                    htmlFor="confirmPassword" 
                    className="absolute text-sm text-secondary-text duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#7C3AED]"
                  >
                    Confirm New Password
                  </label>
                </div>
                {errors.confirmPassword && <span className="text-red-400 text-xs ml-1">{errors.confirmPassword.message}</span>}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="mt-2 relative inline-flex items-center justify-center px-6 py-4 text-sm font-semibold text-primary-text transition-all duration-300 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(124,58,237,0.4)] overflow-hidden group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70 disabled:pointer-events-none"
              >
                {!isSubmitting && <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />}
                <span className="relative flex items-center gap-2">
                  {isSubmitting && <div className="w-4 h-4 border-2 border-divider0 border-t-white rounded-full animate-spin" />}
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </span>
              </button>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
};
