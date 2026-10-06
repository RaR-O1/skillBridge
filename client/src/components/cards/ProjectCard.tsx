import React from 'react';
import { IProject } from '../../types';
import { SkillChip } from '../common/SkillChip';
import { StatusBadge } from '../common/StatusBadge';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { IndianRupee, Calendar, ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: IProject;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const deadlineDate = new Date(project.deadline);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accentBlue dark:text-blue-400">
            {project.category}
          </span>
          <StatusBadge status={project.status} />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-brand dark:hover:text-purple-300 transition-colors">
          <Link to={`/projects/${project._id}`}>{project.title}</Link>
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.requiredSkills.map((skill, idx) => (
            <SkillChip key={idx} name={skill} size="sm" />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-3">
        {/* Business Owner Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
              {project.ownerId?.businessName || project.ownerId?.name}
            </span>
            {project.ownerId?.businessVerified && (
              <VerifiedBadge type="business" size="sm" label="Verified" />
            )}
          </div>

          <div className="flex items-center font-black text-slate-900 dark:text-white text-sm tracking-tight bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            <IndianRupee className="w-3.5 h-3.5" />
            {project.budgetINR.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Deadline & Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due {deadlineDate.toLocaleDateString()}</span>
          </div>

          <Link
            to={`/projects/${project._id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover dark:text-purple-400 dark:hover:text-purple-300 transition-colors py-1.5 px-3 rounded-button bg-brand-light/60 dark:bg-brand/20 min-h-touch"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
