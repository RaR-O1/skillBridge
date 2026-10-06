import React from 'react';
import { ITeam } from '../../types';
import { SkillChip } from '../common/SkillChip';
import { StatusBadge } from '../common/StatusBadge';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeamCardProps {
  team: ITeam;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const deadlineDate = new Date(team.deadline);
  const isPast = new Date() > deadlineDate;
  const isFull = team.members.length >= team.teamSize;
  const isOpen = team.status === 'open' && !isPast && !isFull;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand dark:text-purple-400">
              {team.hackathonName}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-brand dark:hover:text-purple-300 transition-colors">
              <Link to={`/teams/${team._id}`}>{team.title}</Link>
            </h3>
          </div>
          <StatusBadge status={isOpen ? 'open' : 'closed'} />
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {team.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {team.skillsNeeded.map((skill, idx) => (
            <SkillChip key={idx} name={skill} size="sm" />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-3">
        {/* Owner Info & Team Size */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-[10px]">
              {team.ownerId?.name?.charAt(0) || 'U'}
            </div>
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {team.ownerId?.name}
            </span>
            {team.ownerId?.collegeVerified && (
              <VerifiedBadge type="college" size="sm" label="Verified" />
            )}
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {team.members.length} / {team.teamSize} spots
            </span>
          </div>
        </div>

        {/* Deadline & Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due {deadlineDate.toLocaleDateString()}</span>
          </div>

          <Link
            to={`/teams/${team._id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover dark:text-purple-400 dark:hover:text-purple-300 transition-colors py-1.5 px-3 rounded-button bg-brand-light/60 dark:bg-brand/20 min-h-touch"
          >
            <span>View Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
