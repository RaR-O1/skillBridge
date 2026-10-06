import React from 'react';
import { SkillChip } from '../common/SkillChip';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { StarRating } from '../common/StarRating';
import { GraduationCap, Calendar, MessageSquare } from 'lucide-react';

interface MentorCardProps {
  mentor: {
    _id: string;
    name: string;
    bio: string;
    college: string;
    rating: number;
    sessionsCount: number;
    expertise: string[];
  };
  onRequestSession?: (mentorId: string) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onRequestSession }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-sm">
              {mentor.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {mentor.name}
                </h3>
                <VerifiedBadge type="college" size="sm" label="Alumni" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {mentor.college}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <StarRating rating={mentor.rating} size="sm" />
            <span className="text-[10px] text-slate-400 mt-0.5">
              {mentor.sessionsCount} sessions
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {mentor.bio}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {mentor.expertise.map((skill, idx) => (
            <SkillChip key={idx} name={skill} size="sm" />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between">
        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Available for 1:1
        </span>

        <button
          onClick={() => onRequestSession && onRequestSession(mentor._id)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover px-3 py-1.5 rounded-button transition-colors min-h-touch"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Session</span>
        </button>
      </div>
    </div>
  );
};
