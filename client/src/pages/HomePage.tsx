import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import { ITeam, IProject } from '../types';
import { TeamCard } from '../components/cards/TeamCard';
import { ProjectCard } from '../components/cards/ProjectCard';
import { RecommendationCard } from '../components/cards/RecommendationCard';
import { PaymentNoteBanner } from '../components/common/PaymentNoteBanner';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  Sparkles,
  Users,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.teams.list({ status: 'open' }),
      api.projects.list({ status: 'open' }),
    ])
      .then(([teamsRes, projectsRes]) => {
        setTeams(teamsRes.teams?.slice(0, 2) || []);
        setProjects(projectsRes.projects?.slice(0, 2) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand via-purple-700 to-indigo-800 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Opportunity Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>

          <p className="text-sm text-purple-100/90 leading-relaxed">
            Find hackathon teammates, take on direct freelance projects with local businesses, build your verified portfolio, and launch your career.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/teams"
              className="px-4 py-2 bg-white text-brand hover:bg-purple-50 font-bold text-xs rounded-button transition-colors shadow-xs min-h-touch flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Browse Hackathon Teams</span>
            </Link>
            <Link
              to="/projects"
              className="px-4 py-2 bg-purple-900/60 hover:bg-purple-900 text-white font-bold text-xs rounded-button border border-white/20 transition-colors min-h-touch flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Projects</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* College Email Verification Banner if Student is Unverified */}
      {user?.role === 'student' && !user.collegeVerified && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-accentBlue">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Verify your College Email (.edu / .ac.in)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Unlock the Verified Student badge, higher trust score, and priority recruiter visibility.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="shrink-0 px-3 py-1.5 bg-accentBlue text-white text-xs font-semibold rounded-button hover:bg-blue-700 transition-colors min-h-touch flex items-center"
          >
            Verify Now
          </Link>
        </div>
      )}

      {/* Payment Note Banner */}
      <PaymentNoteBanner compact />

      {/* AI Recommendation Sample */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand dark:text-purple-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Recommended for You
            </h2>
          </div>
          <span className="text-xs text-slate-400">Match model v1</span>
        </div>

        <RecommendationCard
          id="rec-01"
          title="Smart India Hackathon: AI Green Energy Grid"
          type="team"
          category="Smart India Hackathon 2026"
          whyMatch="You know React and TypeScript, and the team needs frontend leadership with 1 spot left."
          targetUrl="/teams"
        />
      </div>

      {/* Open Hackathon Teams Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand dark:text-purple-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Open Hackathon Squads
            </h2>
          </div>
          <Link
            to="/teams"
            className="text-xs font-semibold text-brand dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map((team) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </div>
        )}
      </div>

      {/* Open Freelance Projects Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-accentBlue dark:text-blue-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Freelance Gigs from Local Businesses
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-accentBlue dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
