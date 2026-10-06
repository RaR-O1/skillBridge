import React from 'react';
import { Home, Users, Briefcase, Compass, MessageSquare, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const tabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/teams', label: 'Teams', icon: Users },
    { to: '/projects', label: 'Projects', icon: Briefcase },
    { to: '/opportunities', label: 'Explore', icon: Compass },
    { to: '/chat', label: 'Chat', icon: MessageSquare },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around"
    >
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={idx}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-touch min-w-[50px] py-1 text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-brand dark:text-purple-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
