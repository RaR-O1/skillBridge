import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../lib/themeContext';
import { api } from '../../lib/api';
import { INotification, UserRole } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import {
  Bell,
  Sun,
  Moon,
  Sparkles,
  UserCheck,
  Shield,
  LogOut,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, loginAs, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  useEffect(() => {
    if (user) {
      api.notifications
        .getAll(true)
        .then((res) => setNotifications(res.notifications || []))
        .catch(() => {});
    }
  }, [user]);

  const demoAccounts: Array<{ email: string; role: UserRole; name: string; label: string }> = [
    { email: 'aarav.sharma@iitd.ac.in', role: 'student', name: 'Aarav Sharma', label: 'Student (Aarav - Verified IITD)' },
    { email: 'priya.patel@du.ac.in', role: 'student', name: 'Priya Patel', label: 'Student (Priya - Verified DU)' },
    { email: 'owner@kaveribakery.com', role: 'local_business', name: 'Ramesh Verma', label: 'Local Business (Kaveri Bakery)' },
    { email: 'careers@techsprint.io', role: 'company', name: 'Siddharth Rao', label: 'Recruiter (TechSprint)' },
    { email: 'ananya@nexusai.dev', role: 'startup', name: 'Ananya Sen', label: 'Startup Founder (NexusAI)' },
    { email: 'vikram.nair@alumni.iitd.ac.in', role: 'mentor', name: 'Vikram Nair', label: 'Mentor / Alumni (IITD)' },
    { email: 'admin@skillbridge.edu', role: 'admin', name: 'SkillBridge Admin', label: 'Administrator Console' },
  ];

  const handleRoleSwitch = async (acc: typeof demoAccounts[0]) => {
    await loginAs(acc.email, acc.role, acc.name);
    setShowRoleSwitcher(false);
  };

  const markAllRead = async () => {
    await api.notifications.markAllAsRead();
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center font-black text-lg shadow-sm">
            SB
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Skill<span className="text-brand dark:text-purple-400">Bridge</span>
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-light text-brand dark:bg-brand/20 dark:text-purple-300">
              Campus Opportunity Network
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for seamless testing */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-light/70 dark:bg-brand/20 text-brand dark:text-purple-300 rounded-button border border-brand/30 hover:bg-brand-light transition-all min-h-touch"
              title="Switch demo role instantly"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Role:</span>
              <span className="capitalize">{user ? user.role.replace('_', ' ') : 'Select Role'}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  Switch Active Role (Seeded)
                </div>
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRoleSwitch(acc)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between ${
                      user?.email === acc.email ? 'font-bold text-brand dark:text-purple-400 bg-brand-light/30' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{acc.label}</span>
                    {user?.email === acc.email && <span className="w-2 h-2 rounded-full bg-brand" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-button hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-touch min-w-touch flex items-center justify-center"
            title="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-button hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative min-h-touch min-w-touch flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-brand hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                    No new notifications
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-0.5"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {n.title}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                          {n.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile / Status */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-brand text-white font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {user.name}
                    {user.collegeVerified && <VerifiedBadge type="college" size="sm" label="" />}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {user.role.replace('_', ' ')} • Trust {user.trustScore}
                  </div>
                </div>
              </Link>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-danger rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/onboarding"
              className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-button min-h-touch flex items-center"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
