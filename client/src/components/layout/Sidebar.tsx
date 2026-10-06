import React from 'react';
import { useAuth } from '../../lib/authContext';
import {
  Home,
  Users,
  Briefcase,
  Compass,
  MessageSquare,
  User,
  CheckSquare,
  ShieldCheck,
  FileText,
  BarChart3,
  Award,
  BookOpen,
  Kanban,
  Building,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const getNavLinks = () => {
    switch (role) {
      case 'student':
        return [
          { to: '/', label: 'Home', icon: Home },
          { to: '/teams', label: 'Hackathon Teams', icon: Users },
          { to: '/projects', label: 'Freelance Projects', icon: Briefcase },
          { to: '/opportunities', label: 'Opportunities', icon: Compass },
          { to: '/chat', label: 'Messages & Chat', icon: MessageSquare },
          { to: '/profile', label: 'My Portfolio', icon: User },
        ];
      case 'local_business':
        return [
          { to: '/', label: 'Home', icon: Home },
          { to: '/projects', label: 'My Projects', icon: Briefcase },
          { to: '/chat', label: 'Project Chat', icon: MessageSquare },
          { to: '/profile', label: 'Business Profile', icon: Building },
        ];
      case 'company':
        return [
          { to: '/', label: 'Dashboard', icon: Home },
          { to: '/opportunities', label: 'Postings & Jobs', icon: Briefcase },
          { to: '/opportunities?tab=talent', label: 'Student Talent', icon: Users },
          { to: '/chat', label: 'Recruiter Chat', icon: MessageSquare },
          { to: '/profile', label: 'Company Profile', icon: Building },
        ];
      case 'startup':
        return [
          { to: '/', label: 'Founder Home', icon: Home },
          { to: '/opportunities', label: 'Open Roles', icon: Briefcase },
          { to: '/teams', label: 'Co-Founders', icon: Users },
          { to: '/chat', label: 'Messages', icon: MessageSquare },
          { to: '/profile', label: 'Startup Pitch', icon: Building },
        ];
      case 'mentor':
        return [
          { to: '/', label: 'Mentor Home', icon: Home },
          { to: '/opportunities', label: 'Session Requests', icon: CheckSquare },
          { to: '/chat', label: 'Mentee Chat', icon: MessageSquare },
          { to: '/profile', label: 'Mentor Profile', icon: Award },
        ];
      case 'admin':
        return [
          { to: '/admin', label: 'Admin Console', icon: ShieldCheck },
          { to: '/admin?tab=queue', label: 'Verification Queue', icon: CheckSquare },
          { to: '/admin?tab=reports', label: 'Disputes & Reports', icon: FileText },
          { to: '/admin?tab=metrics', label: 'Platform Metrics', icon: BarChart3 },
          { to: '/', label: 'User View', icon: Home },
        ];
      default:
        return [
          { to: '/', label: 'Home', icon: Home },
          { to: '/teams', label: 'Teams', icon: Users },
          { to: '/projects', label: 'Projects', icon: Briefcase },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
          Navigation ({role.replace('_', ' ')})
        </span>

        <nav className="space-y-1 pt-2">
          {links.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-touch ${
                    isActive
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Trust & Guarantee Box */}
      <div className="mt-auto p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>Trust & Agreement</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Mutual price cards must be confirmed before project status transitions to assigned.
        </p>
      </div>
    </aside>
  );
};
