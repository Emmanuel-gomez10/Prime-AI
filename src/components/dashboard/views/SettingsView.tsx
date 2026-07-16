import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Shield, CreditCard, User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const SettingsView = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    aiSuggestions: true,
    dataSharing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('prime_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('prime_settings', JSON.stringify(newSettings));
    
    if (key === 'darkMode') {
      if (newSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 h-full overflow-y-auto scrollbar-hide">
      <div className="mb-8 shrink-0">
        <h2 className="text-3xl font-bold text-primary-text mb-2 tracking-tight">Settings</h2>
        <p className="text-secondary-text text-[15px]">Manage your account preferences, notifications, and application settings.</p>
      </div>

      <div className="space-y-6 pb-20">
        
        {/* Profile Section */}
        <div className="p-6 md:p-8 rounded-[24px] bg-surface border border-divider shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-text text-2xl font-bold shadow-inner">
              {user?.email?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-text">{user?.email?.split('@')[0] || 'Student User'}</h3>
              <p className="text-secondary-text">{user?.email || 'student@university.edu'}</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-card-hover hover:bg-card-hover text-primary-text rounded-xl font-medium transition-colors text-sm border border-divider">
            Edit Profile
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Preferences */}
          <div className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg">
            <h3 className="text-lg font-bold text-primary-text mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Preferences
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-primary-text font-medium mb-1">Dark Mode</h4>
                  <p className="text-secondary-text text-xs">Use dark theme across the app</p>
                </div>
                <button 
                  onClick={() => toggleSetting('darkMode')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-primary' : 'bg-card-hover'}`}
                >
                  <motion.div 
                    layout 
                    className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" 
                    animate={{ x: settings.darkMode ? 24 : 0 }} 
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-primary-text font-medium mb-1">AI Suggestions</h4>
                  <p className="text-secondary-text text-xs">Smart autocomplete and study tips</p>
                </div>
                <button 
                  onClick={() => toggleSetting('aiSuggestions')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.aiSuggestions ? 'bg-primary' : 'bg-card-hover'}`}
                >
                  <motion.div 
                    layout 
                    className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" 
                    animate={{ x: settings.aiSuggestions ? 24 : 0 }} 
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg">
            <h3 className="text-lg font-bold text-primary-text mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              Notifications
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-primary-text font-medium mb-1">Email Notifications</h4>
                  <p className="text-secondary-text text-xs">Weekly study reports and updates</p>
                </div>
                <button 
                  onClick={() => toggleSetting('emailNotifications')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailNotifications ? 'bg-primary' : 'bg-card-hover'}`}
                >
                  <motion.div 
                    layout 
                    className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" 
                    animate={{ x: settings.emailNotifications ? 24 : 0 }} 
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-primary-text font-medium mb-1">Push Notifications</h4>
                  <p className="text-secondary-text text-xs">Study session reminders</p>
                </div>
                <button 
                  onClick={() => toggleSetting('pushNotifications')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.pushNotifications ? 'bg-primary' : 'bg-card-hover'}`}
                >
                  <motion.div 
                    layout 
                    className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" 
                    animate={{ x: settings.pushNotifications ? 24 : 0 }} 
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="p-6 rounded-[24px] bg-surface border border-divider shadow-lg md:col-span-2">
            <h3 className="text-lg font-bold text-primary-text mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Privacy & Data
            </h3>
            <div className="flex items-center justify-between pb-5 border-b border-divider mb-5">
              <div>
                <h4 className="text-primary-text font-medium mb-1">Data Sharing</h4>
                <p className="text-secondary-text text-sm">Help improve Prime AI by sharing anonymous usage data</p>
              </div>
              <button 
                onClick={() => toggleSetting('dataSharing')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.dataSharing ? 'bg-primary' : 'bg-card-hover'}`}
              >
                <motion.div 
                  layout 
                  className="w-4 h-4 rounded-full bg-white absolute top-1 left-1" 
                  animate={{ x: settings.dataSharing ? 24 : 0 }} 
                />
              </button>
            </div>
            <button className="flex items-center justify-between w-full group">
              <div className="text-left">
                <h4 className="text-primary-text font-medium group-hover:text-primary transition-colors">Export Study Data</h4>
                <p className="text-secondary-text text-sm">Download all your generated notes and flashcards</p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary-text/20 group-hover:text-primary transition-colors" />
            </button>
          </div>

        </div>

        {/* Danger Zone */}
        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 text-red-400/70 hover:text-red-400 font-medium transition-colors px-4 py-2 hover:bg-red-400/10 rounded-lg">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};
