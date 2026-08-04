import React, { useState } from 'react';
import { User, Mail, School, Shield, Key, Camera, Check, Save, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';

export const ProfileView = () => {
  const { user, updateProfile, updatePassword, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [university, setUniversity] = useState(user?.user_metadata?.university || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        university: university,
      });
      if (error) {
        toast.error(error.message || 'Failed to update profile');
      } else {
        toast.success('Profile information updated successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error.message || 'Failed to update password');
      } else {
        toast.success('Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-divider">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight">Account Profile</h1>
          <p className="text-secondary-text text-sm mt-1">Manage your personal details, academic preferences, and security settings.</p>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl bg-surface/50 border border-divider backdrop-blur-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_25px_rgba(168,85,247,0.3)]">
            {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 rounded-lg bg-background border border-divider text-secondary-text hover:text-primary-text transition-colors shadow-md">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-primary-text">{fullName || 'Student Account'}</h2>
          <p className="text-secondary-text text-sm">{user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <School className="w-3.5 h-3.5" />
              {university || 'University Student'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Check className="w-3.5 h-3.5" /> Active Prime Student
            </span>
          </div>
        </div>
      </div>

      {/* Details & Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <form onSubmit={handleProfileSave} className="p-6 rounded-2xl bg-surface/40 border border-divider space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-divider">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-primary-text">Personal Details</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1.5">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-background border border-divider rounded-xl px-4 py-2.5 pl-10 text-sm text-primary-text focus:outline-none focus:border-primary/50 transition-all"
              />
              <User className="w-4 h-4 text-secondary-text absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1.5">Email Address</label>
            <div className="relative opacity-70">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-background/50 border border-divider rounded-xl px-4 py-2.5 pl-10 text-sm text-secondary-text cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-secondary-text absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-secondary-text mt-1">Email cannot be changed directly.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1.5">University / Institution</label>
            <div className="relative">
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. UNIZIK, Unilag, Covenant University"
                className="w-full bg-background border border-divider rounded-xl px-4 py-2.5 pl-10 text-sm text-primary-text focus:outline-none focus:border-primary/50 transition-all"
              />
              <School className="w-4 h-4 text-secondary-text absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>

        {/* Password & Security Form */}
        <form onSubmit={handlePasswordSave} className="p-6 rounded-2xl bg-surface/40 border border-divider space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-divider">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-primary-text">Security & Credentials</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1.5">New Password</label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-background border border-divider rounded-xl px-4 py-2.5 pl-10 text-sm text-primary-text focus:outline-none focus:border-primary/50 transition-all"
              />
              <Key className="w-4 h-4 text-secondary-text absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-background border border-divider rounded-xl px-4 py-2.5 pl-10 text-sm text-primary-text focus:outline-none focus:border-primary/50 transition-all"
              />
              <Key className="w-4 h-4 text-secondary-text absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Updating password will secure your account across all active browser sessions.</span>
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
