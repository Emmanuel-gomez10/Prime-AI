import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, User, Check, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';


export const SettingsView = () => {
  const { user } = useAuth();
  
  // Account Profile State
  const [fullName, setFullName] = useState('Student User');
  const [university, setUniversity] = useState('UNIZIK');
  const [studyLevel, setStudyLevel] = useState('Undergraduate (100 Level)');
  const [learningStyle, setLearningStyle] = useState('Visual & Active Recall');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // App Toggles
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    aiSuggestions: true,
    dataSharing: false,
  });

  useEffect(() => {
    const savedKey = localStorage.getItem('prime_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    if (savedKey) setApiKey(savedKey);

    const savedProfile = localStorage.getItem('prime_user_profile_v2');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setFullName(parsed.fullName || 'Student User');
        setUniversity(parsed.university || 'UNIZIK');
        setStudyLevel(parsed.studyLevel || 'Undergraduate (100 Level)');
        setLearningStyle(parsed.learningStyle || 'Visual & Active Recall');
      } catch (e) {
        console.error("Failed to load user profile:", e);
      }
    } else if (user?.email) {
      setFullName(user.email.split('@')[0]);
    }

    const savedSettings = localStorage.getItem('prime_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
  }, [user]);

  const handleSaveProfile = () => {
    const profile = { fullName, university, studyLevel, learningStyle };
    localStorage.setItem('prime_user_profile_v2', JSON.stringify(profile));
    if (apiKey) {
      localStorage.setItem('prime_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('prime_gemini_api_key');
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('prime_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-6 h-full overflow-y-auto scrollbar-hide">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-1 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-primary" /> Profile & Account Settings
          </h2>
          <p className="text-secondary-text text-[14px]">Manage student profile details, study level preferences, and application notifications.</p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Saved!' : 'Save Profile'}</span>
        </button>
      </div>

      <div className="space-y-6 pb-20">
        
        {/* Profile Card */}
        <div className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg space-y-6">
          <div className="flex items-center gap-4 border-b border-divider pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-inner shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-text">{fullName}</h3>
              <p className="text-xs text-secondary-text">{user?.email || 'student@university.edu'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1 block">Full Name</label>
              <input 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1 block">University / Institution</label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text outline-none focus:border-primary/50"
              >
                {['UNIZIK', 'UNILAG', 'OAU', 'UI', 'ABU', 'UNN', 'Other Institution'].map(u => (
                  <option key={u} value={u} className="bg-surface text-primary-text">{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1 block">Study Level</label>
              <select
                value={studyLevel}
                onChange={(e) => setStudyLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text outline-none focus:border-primary/50"
              >
                {[
                  'Undergraduate (100 Level)',
                  'Undergraduate (200 Level)',
                  'Undergraduate (300 Level)',
                  'Undergraduate (400 Level)',
                  'Postgraduate / Masters',
                  'High School / Secondary'
                ].map(l => (
                  <option key={l} value={l} className="bg-surface text-primary-text">{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1 block">Preferred Learning Style</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text outline-none focus:border-primary/50"
              >
                {[
                  'Visual & Active Recall',
                  'Step-by-Step Problem Solving',
                  'Concise Bullet Summaries',
                  'Interactive Quizzes & Practice'
                ].map(s => (
                  <option key={s} value={s} className="bg-surface text-primary-text">{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preferences & Notifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Preferences */}
          <div className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg space-y-4">
            <h3 className="text-base font-bold text-primary-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Preferences & API Key
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1 block">
                  Gemini API Key (Optional Override)
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-2.5 pr-20 rounded-xl bg-background border border-divider text-xs sm:text-sm text-primary-text outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-card-hover text-secondary-text text-xs hover:text-primary-text transition-colors"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[11px] text-secondary-text mt-1">
                  Provided via Vercel env (`VITE_GEMINI_API_KEY`) or entered here for backup.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-divider">
                <div>
                  <h4 className="text-xs font-bold text-primary-text mb-0.5">Smart AI Autocomplete</h4>
                  <p className="text-secondary-text text-[11px]">Inline prompt suggestions & automatic study tips</p>
                </div>
                <button 
                  onClick={() => toggleSetting('aiSuggestions')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${settings.aiSuggestions ? 'bg-primary' : 'bg-card-hover'}`}
                >
                  <motion.div 
                    layout 
                    className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" 
                    animate={{ x: settings.aiSuggestions ? 20 : 0 }} 
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg space-y-4">
            <h3 className="text-base font-bold text-primary-text flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-primary-text mb-0.5">Email Summaries</h4>
                  <p className="text-secondary-text text-[11px]">Weekly study performance reports</p>
                </div>
                <button 
                  onClick={() => toggleSetting('emailNotifications')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${settings.emailNotifications ? 'bg-primary' : 'bg-card-hover'}`}
                >
                  <motion.div 
                    layout 
                    className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" 
                    animate={{ x: settings.emailNotifications ? 20 : 0 }} 
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-primary-text mb-0.5">Study Reminders</h4>
                  <p className="text-secondary-text text-[11px]">Exam countdown & study session alerts</p>
                </div>
                <button 
                  onClick={() => toggleSetting('pushNotifications')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${settings.pushNotifications ? 'bg-primary' : 'bg-card-hover'}`}
                >
                  <motion.div 
                    layout 
                    className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" 
                    animate={{ x: settings.pushNotifications ? 20 : 0 }} 
                  />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

