import React from 'react';
import { SkillChip } from '../common/SkillChip';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { Briefcase, MapPin, IndianRupee, ArrowRight } from 'lucide-react';

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    companyName: string;
    type: 'Internship' | 'Full-time' | 'Contract';
    location: string;
    stipendINR: number;
    skills: string[];
    deadline: string;
  };
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {job.companyName}
              </span>
              <VerifiedBadge type="business" size="sm" label="Verified" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {job.title}
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-accentBlue dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {job.type}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className="flex items-center gap-0.5 font-semibold text-slate-800 dark:text-slate-200">
            <IndianRupee className="w-3.5 h-3.5" />
            {job.stipendINR.toLocaleString('en-IN')}/mo
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {job.skills.map((skill, idx) => (
            <SkillChip key={idx} name={skill} size="sm" />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Due {new Date(job.deadline).toLocaleDateString()}
        </span>
        <button className="inline-flex items-center gap-1 text-xs font-bold text-white bg-brand hover:bg-brand-hover px-3 py-1.5 rounded-button transition-colors min-h-touch">
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
