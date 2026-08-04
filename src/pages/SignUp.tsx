import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  university: z.string().optional(),
  email: z.string().email('Invalid email address'),
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

type SignUpFormData = z.infer<typeof signUpSchema>;

export const SignUp = () => {
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  });

  const onSubmit = async (formData: SignUpFormData) => {
    if (!agreedToTerms) {
      toast.error('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await signup(formData.email, formData.password, {
      fullName: formData.fullName,
      university: formData.university,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || 'Error creating account');
    } else {
      if (data?.session) {
        toast.success('Welcome to Prime AI!');
        navigate('/dashboard');
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        navigate('/verify-email', { state: { email: formData.email } });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message || 'Google Sign-In failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#070816] text-primary-text flex flex-col md:flex-row font-sans selection:bg-primary/30">
      
      {/* LEFT SIDE - Marketing Panel */}
      <div className="w-full md:w-1/2 lg:w-[55%] relative p-8 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-divider overflow-hidden min-h-[50vh] md:min-h-screen">
        
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7C3AED]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#41E5FF]/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full max-w-xl mx-auto md:mx-0 w-full">
          
          {/* Logo Header */}
          <motion.a 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            href="/" 
            className="flex items-center gap-3 w-max focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          >
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
          </motion.a>

          {/* Headline & Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 lg:mt-20 mb-10"
          >
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Study Smarter with AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#41E5FF]">Built for Students</span>
            </h1>
            <p className="text-lg text-secondary-text leading-relaxed max-w-md">
              Prime AI helps students summarize notes, solve assignments, prepare for exams, generate flashcards, and organize study materials—all in one intelligent workspace.
            </p>
          </motion.div>

          {/* Comparison Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-10 relative group rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-divider p-6 shadow-2xl hover:bg-white/[0.05] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px] pointer-events-none" />
            
            <h3 className="text-base font-bold text-primary-text uppercase tracking-widest mb-6">
              Built for Students. Not Just General AI.
            </h3>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 relative z-10">
              {/* General AI Col */}
              <div className="flex flex-col gap-3">
                <h4 className="text-secondary-text text-base font-medium mb-2 border-b border-divider pb-2">General AI Assistants</h4>
                {[
                  "General-purpose conversations",
                  "Requires detailed prompting",
                  "Multiple disconnected tools",
                  "No dedicated study workspace",
                  "Generic responses"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-secondary-text">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              
              {/* Prime AI Col */}
              <div className="flex flex-col gap-3">
                <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#41E5FF] text-base font-semibold mb-2 border-b border-divider pb-2">Prime AI</h4>
                {[
                  "Purpose-built for students",
                  "Guided academic workflows",
                  "All study tools in one platform",
                  "AI study dashboard",
                  "Optimized for learning"
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                    key={i} 
                    className="flex items-start gap-2 text-primary-text group/item"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#41E5FF] group-hover/item:scale-110 transition-transform" />
                    <span className="text-sm leading-relaxed font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-auto flex flex-col gap-3"
          >
            <div className="flex gap-1 text-[#FFD700]">
              {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
            </div>
            <p className="text-primary-text italic text-sm md:text-base leading-relaxed">
              "Prime AI helped me organize my study routine and prepare more efficiently for exams."
            </p>
            <p className="text-secondary-text text-xs md:text-sm font-medium">— University Student</p>
          </motion.div>

        </div>
      </div>

      {/* RIGHT SIDE - Authentication Panel */}
      <div className="w-full md:w-1/2 lg:w-[45%] p-6 md:p-12 lg:p-16 flex items-center justify-center relative z-20">
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-[#0d1024]/80 backdrop-blur-2xl rounded-3xl border border-divider p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden"
        >
          {/* Subtle top glow inside the card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Welcome</h2>
            <p className="text-secondary-text text-sm mb-8">Create an account to start your premium learning journey.</p>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
              
              <div className="flex flex-col gap-1">
                <div className="relative group">
                  <input 
                    type="text" 
                    id="fullName" 
                    placeholder=" "
                    {...register('fullName')}
                    className="block w-full px-4 pt-6 pb-2 text-sm text-primary-text bg-card-hover border border-divider rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-[#7C3AED] focus:bg-card-hover peer transition-all duration-300 shadow-inner"
                  />
                  <label 
                    htmlFor="fullName" 
                    className="absolute text-sm text-secondary-text duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#7C3AED]"
                  >
                    Full Name
                  </label>
                </div>
                {errors.fullName && <span className="text-red-400 text-xs ml-1">{errors.fullName.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative group">
                  <input 
                    type="text" 
                    id="university" 
                    placeholder=" "
                    {...register('university')}
                    className="block w-full px-4 pt-6 pb-2 text-sm text-primary-text bg-card-hover border border-divider rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-[#7C3AED] focus:bg-card-hover peer transition-all duration-300 shadow-inner"
                  />
                  <label 
                    htmlFor="university" 
                    className="absolute text-sm text-secondary-text duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#7C3AED]"
                  >
                    University (Optional)
                  </label>
                </div>
              </div>

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
                    Password
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
                    Confirm Password
                  </label>
                </div>
                {errors.confirmPassword && <span className="text-red-400 text-xs ml-1">{errors.confirmPassword.message}</span>}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="mt-4 relative inline-flex items-center justify-center px-6 py-4 text-sm font-semibold text-primary-text transition-all duration-300 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B8CFF] hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(124,58,237,0.4)] overflow-hidden group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70 disabled:pointer-events-none"
              >
                {!isSubmitting && <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />}
                <span className="relative flex items-center gap-2">
                  {isSubmitting && <div className="w-4 h-4 border-2 border-divider0 border-t-white rounded-full animate-spin" />}
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </span>
              </button>

            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-secondary-text text-xs uppercase tracking-wider font-semibold">Or</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 text-sm font-medium text-primary-text transition-all duration-300 rounded-xl bg-card-hover border border-divider hover:bg-card-hover hover:border-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-8 flex flex-col items-center gap-5 text-sm">
              <p className="text-secondary-text">
                Already have an account? <Link to="/login" className="text-[#41E5FF] hover:text-primary-text transition-colors font-medium relative after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-[1px] after:bg-[#41E5FF]/50 hover:after:bg-white/80">Log In</Link>
              </p>
              
              <div className="flex items-start gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 shrink-0 w-4 h-4 rounded-[4px] border-white/20 bg-card-hover text-[#7C3AED] focus:ring-[#7C3AED] focus:ring-offset-0 focus:ring-offset-transparent transition-colors cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-secondary-text leading-relaxed cursor-pointer select-none hover:text-secondary-text transition-colors">
                  By creating an account, you agree to our <a href="#" className="text-secondary-text hover:text-primary-text underline decoration-white/20 underline-offset-2 transition-colors">Terms of Service</a> and <a href="#" className="text-secondary-text hover:text-primary-text underline decoration-white/20 underline-offset-2 transition-colors">Privacy Policy</a>.
                </label>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

    </div>
  );
};
